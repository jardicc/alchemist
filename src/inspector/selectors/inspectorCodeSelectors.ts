/* eslint-disable quotes */
import { cloneDeep } from "lodash";
import { createSelector } from "reselect";
import { RawDataConverter } from "../classes/RawDataConverter";
import { IDescriptor, IDescriptorSettings } from "../model/types";
import { getContentPath } from "./inspectorContentSelectors";
import { all, getActiveDescriptors, getAutoActiveDescriptor, getInspectorSettings, getReplayEnabled } from "./inspectorSelectors";
import stringifyObject from "stringify-object";
import {ActionDescriptor, BatchPlayCommandOptions} from "photoshop/dom/CoreModules";
import {js_beautify} from "js-beautify";

type BatchPlayCommandOptionsExtended = BatchPlayCommandOptions & {synchronousExecution?:boolean}

export const getDescriptorOptions = createSelector([getActiveDescriptors, getAutoActiveDescriptor,getInspectorSettings], (selected, autoActive,settings) => {

	function getValue<T>(arr: T[]): T | "mixed" {
		const first = arr[0];
		const res = arr.every(item => item === first);
		if (res) {
			return first;
		} else {
			return "mixed";
		}
	}

	if (autoActive) {
		return settings.initialDescriptorSettings;
	}

	const desc:IDescriptor[] = selected;
	const res: IDescriptorSettings = {
		supportRawDataType: getValue(desc.map(item=>item.descriptorSettings.supportRawDataType)),
		dialogOptions: getValue(desc.map(item=>item.descriptorSettings.dialogOptions)),
		modalBehavior: getValue(desc.map(item=>item.descriptorSettings.modalBehavior)),
		synchronousExecution: getValue(desc.map(item=>item.descriptorSettings.synchronousExecution)),
	};

	return res;
});

export const getIndentString = createSelector([getInspectorSettings], settings => {
	let indent = "\t";

	if (settings.indent !== "tab") {
		indent = " ".repeat(parseInt(settings.indent.charAt(settings.indent.length - 1)));
	}

	return indent;
});

export const getGeneratedCode = createSelector([
	getActiveDescriptors, getAutoActiveDescriptor, getContentPath,
	getReplayEnabled, getDescriptorOptions, getInspectorSettings, getIndentString,
], (selected, autoActive, treePath, replayEnabled, descOptions, settings, tab) => {

	function makeNicePropertyPath(segments: string[]): string {
		const regex = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/m;
		
		let result = "";

		for (const s of segments) {
			if (regex.test(s)) {
				result += "." + s;
			} else if (typeof s === "number") {
				result += `[${s}]`;
			}
			else {
				result += `["${s}"]`;
			}
		}

		return result;
	}

	function addPerItemOptions(data: IDescriptor) {
		if (data.descriptorSettings.dialogOptions) {
			data = cloneDeep(data);
			(data.playAbleData as ActionDescriptor)._options = {
				dialogOptions: data.descriptorSettings.dialogOptions,
			} as IDescriptorSettings;
		}
		return data.playAbleData;
	}

	function addCommonOptions(data: IDescriptor[]): BatchPlayCommandOptionsExtended {

		const hasAnyAsync = data.some(item => item.descriptorSettings.synchronousExecution === false);
		const hasAnySync = data.some(item => item.descriptorSettings.synchronousExecution === true);

		const modalIsExecute = data.every(item => item.descriptorSettings.modalBehavior === "execute");
		const modalIsWait = data.every(item => item.descriptorSettings.modalBehavior === "wait");
		const modalIsDefault = data.every(item => !item.descriptorSettings.modalBehavior);

		const res: BatchPlayCommandOptionsExtended = {};

		if (hasAnySync) { res.synchronousExecution = true; }
		else if (hasAnyAsync) { res.synchronousExecution = false; }

		if (modalIsExecute) { res.modalBehavior = "execute"; }
		else if (modalIsWait) { res.modalBehavior = "wait"; }
		else if (!modalIsDefault) { res.modalBehavior = "fail"; }

		return res;
	}

	// adds indentation
	function idt(str:string):string {
		return str.split("\n").map(l => tab + l).join("\n");
	}

	function udt(str: string): string{
		return str.split("\n").map(l => l.replace(tab, "")).join("\n");
	}

	// replaces quotes
	function qts(str:string):string {
		if (settings.singleQuotes) {
			str = str.replaceAll(`"`, `'`);
		}
		return str;
	}

	const addModules = settings.codeImports === "require";
	const wrappers = settings.codeWrappers;

	if (selected.length >= 1 || autoActive) {
		let data:any = null, iDesc: IDescriptor[] = [];

		const stringifyOptions = {
			singleQuotes: settings.singleQuotes,
			indent: tab,
		};

		const playAbleInfo = "// Alchemist can't generate code from the reply of replay and from dispatched code.";
		const notifierWarning = "// Events recognized as notifiers are not re-playable in most of the cases. There is high chance that generated code won't work.\n\n";

		if (selected.length >= 1) {
			iDesc = selected;
		} else if (autoActive) {
			iDesc = [autoActive];
		}
		if (iDesc.some(item => ["replies","dispatcher"].includes(item.originalReference.type))) {
			return playAbleInfo;
		}
		data = iDesc.map(item => addPerItemOptions(item));
		// adds raw data type support
		data = cloneDeep(data);

		if (Array.isArray(data)) {
			data.forEach(d => {
				if (settings.hideDontRecord) {
					delete d.dontRecord;				
				}
				if (settings.hideForceNotify) {
					delete d.forceNotify;				
				}
				if (settings.hide_isCommand) {
					delete d._isCommand;
				}				
			});
		}
		
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			RawDataConverter.convertFakeRawInCode(item,descOptions);
		}

		let strPinned = "";

		if (treePath.length) {
			// eslint-disable-next-line quotes
			strPinned = qts(`\n\nconst pinned = result${makeNicePropertyPath(treePath)};`);
		}
		
		const commandOptions = addCommonOptions(iDesc);

		const strOptions = idt(stringifyObject(commandOptions, stringifyOptions));
		const strDesc:string = stringifyObject(data, stringifyOptions);


		const strExecModalImport = addModules ? qts(`const {executeAsModal} = require("photoshop").core;\n`) : "";
		const strBatchPlayImport = addModules ? qts(`const {batchPlay} = require("photoshop").action;\n\n`) : "";

		const strBatchPlay = `const result = await batchPlay(\n${idt(strDesc)},\n${strOptions}\n);${strPinned}`;
		const strActionCommand = `async function actionCommands() {\n${idt(strBatchPlay)}\n}\n\n`;

		const strCall = qts(`async function runModalFunction() {\n${tab}await executeAsModal(actionCommands, {"commandName": "Action Commands"});\n}\n\nawait runModalFunction();\n`);

		let banner = "";
		if (iDesc.some(item => item.originalReference.type === "notifier")) {
			banner = notifierWarning;
		}
			
		
		if (wrappers==="batchPlay") {
			return (
				banner +
				strBatchPlayImport +
				strBatchPlay
			);
		} else if (wrappers==="modal") {
			return (
				banner +
				strExecModalImport +
				strBatchPlayImport +
				strActionCommand +
				strCall
			);
		} else if (wrappers === "array") {
			return (
				banner +
				strDesc
			);
		} else if (wrappers === "objects") {
			return (
				banner +
				udt(strDesc.slice(2, -2))
			);
		}

		return "";
	} else {
		return "Add some descriptor";
	}
});

// TODO ... not currently in use
export const getGeneratedCode2 = createSelector([
	getActiveDescriptors, getAutoActiveDescriptor, getContentPath,
	getReplayEnabled, getDescriptorOptions, getInspectorSettings, getIndentString,
], (selected, autoActive, treePath, replayEnabled, descOptions, settings, tab) => {

	function makeNicePropertyPath(segments: string[]): string {
		const regex = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/m;
		
		let result = "";

		for (const s of segments) {
			if (regex.test(s)) {
				result += "." + s;
			} else if (typeof s === "number") {
				result += `[${s}]`;
			}
			else {
				result += `["${s}"]`;
			}
		}

		return result;
	}

	function addPerItemOptions(data: IDescriptor) {
		if (data.descriptorSettings.dialogOptions) {
			data = cloneDeep(data);
			(data.playAbleData as ActionDescriptor)._options = {
				dialogOptions: data.descriptorSettings.dialogOptions,
			} as IDescriptorSettings;
		}
		return data.playAbleData;
	}

	function addCommonOptions(data: IDescriptor[]): BatchPlayCommandOptionsExtended {

		const hasAnyAsync = data.some(item => item.descriptorSettings.synchronousExecution === false);
		const hasAnySync = data.some(item => item.descriptorSettings.synchronousExecution === true);

		const modalIsExecute = data.every(item => item.descriptorSettings.modalBehavior === "execute");
		const modalIsWait = data.every(item => item.descriptorSettings.modalBehavior === "wait");
		const modalIsDefault = data.every(item => !item.descriptorSettings.modalBehavior);

		const res: BatchPlayCommandOptionsExtended = {};

		if (hasAnySync) { res.synchronousExecution = true; }
		else if (hasAnyAsync) { res.synchronousExecution = false; }

		if (modalIsExecute) { res.modalBehavior = "execute"; }
		else if (modalIsWait) { res.modalBehavior = "wait"; }
		else if (!modalIsDefault) { res.modalBehavior = "fail"; }

		return res;
	}

	// replaces quotes
	function qts(str:string):string {
		if (settings.singleQuotes) {
			str = str.replaceAll(`"`, `'`);
		}
		return str;
	}

	const addModules = settings.codeImports === "require";
	const wrappers = settings.codeWrappers;

	if (selected.length >= 1 || autoActive) {
		let data:any = null, iDesc: IDescriptor[] = [];

		const stringifyOptions = {
			singleQuotes: settings.singleQuotes,
			indent: tab,
		};

		if (selected.length >= 1) {
			iDesc = selected;
		} else if (autoActive) {
			iDesc = [autoActive];
		}
		if (iDesc.some(item => ["replies","notifier","dispatcher"].includes(item.originalReference.type))) {
			return "// Alchemist can't generate code from replay reply, dispatched code. Notifiers are not supported to save your time because those are non-playable in 99.99% of cases";
		}
		data = iDesc.map(item => addPerItemOptions(item));
		// adds raw data type support
		data = cloneDeep(data);

		if (Array.isArray(data)) {
			data.forEach(d => {
				if (settings.hideDontRecord) {
					delete d.dontRecord;				
				}
				if (settings.hideForceNotify) {
					delete d.forceNotify;				
				}
				if (settings.hide_isCommand) {
					delete d._isCommand;
				}				
			});
		}
		
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			RawDataConverter.convertFakeRawInCode(item,descOptions);
		}

		let strPinned = "";

		if (treePath.length) {
			// eslint-disable-next-line quotes
			strPinned = qts(`\n\nconst pinned = result${makeNicePropertyPath(treePath)};`);
		}
		
		const commandOptions = addCommonOptions(iDesc);

		const strOptions = stringifyObject(commandOptions, stringifyOptions);
		const strDesc: string = stringifyObject(data, stringifyOptions);
		
		const code = `
		${addModules ? `const {executeAsModal} = require("photoshop").core;` : ''}
		const {batchPlay} = require("photoshop").action;
		
		async function actionCommands() {
		   const result = await batchPlay(
			  ${strDesc},${strOptions}
		   );
		}
		
		async function runModalFunction() {
		   await executeAsModal(actionCommands, {"commandName": "Action Commands"});
		}
		
		await runModalFunction();
`;		

		return js_beautify(code,{preserve_newlines: true,brace_style: "preserve-inline",end_with_newline:true});
	} else {
		return "Add some descriptor";
	}
	return "";
});

export const getCodeContentTab = createSelector([all], t => {
	return t.inspector.code;
});

export const getCodeActiveView = createSelector([getCodeContentTab], t => {
	return t.viewType;
});