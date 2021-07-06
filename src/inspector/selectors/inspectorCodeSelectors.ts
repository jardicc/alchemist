import { cloneDeep } from "lodash";
import { CommandOptions } from "photoshop/dist/types/UXP";
import { createSelector } from "reselect";
import { RawDataConverter } from "../classes/RawDataConverter";
import { IDescriptor, IDescriptorSettings } from "../model/types";
import { getContentPath } from "./inspectorContentSelectors";
import { all, getActiveDescriptors, getAutoActiveDescriptor, getInspectorSettings, getReplayEnabled } from "./inspectorSelectors";



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

export const getActiveDescriptorCalculatedReference = createSelector([getActiveDescriptors, getAutoActiveDescriptor, getContentPath, getReplayEnabled, getDescriptorOptions], (selected, autoActive, treePath, replayEnabled,descOptions) => {

	function makeNicePropertyPath(segments: string[]): string {
		const regex = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/m;
		
		let result = "";

		for (const s of segments) {
			if (regex.test(s)) {
				result += "." + s;
			} else if (typeof s === "number") {
				result += "[" + s + "]";
			}
			else {
				result += "[\"" + s + "\"]";
			}
		}

		return result;
	}

	function addPerItemOptions(data: IDescriptor) {
		if (data.descriptorSettings.dialogOptions) {
			data = cloneDeep(data);
			data.calculatedReference._options = {
				dialogOptions: data.descriptorSettings.dialogOptions,
			} as IDescriptorSettings;
		}
		return data.calculatedReference;
	}

	function addCommonOptions(data: IDescriptor[]): CommandOptions {
		const hasAnyAsync = data.some(item => item.descriptorSettings.synchronousExecution === false);
		const hasAnySync = data.some(item => item.descriptorSettings.synchronousExecution === true);

		const modalIsExecute = data.every(item => item.descriptorSettings.modalBehavior === "execute");
		const modalIsWait = data.every(item => item.descriptorSettings.modalBehavior === "wait");
		const modalIsDefault = data.every(item => !item.descriptorSettings.modalBehavior);

		const res: CommandOptions = {};

		if (hasAnySync) { res.synchronousExecution = true; }
		else if (hasAnyAsync) { res.synchronousExecution = false; }

		if (modalIsExecute) { res.modalBehavior = "execute"; }
		else if (modalIsWait) { res.modalBehavior = "wait"; }
		else if (!modalIsDefault) { res.modalBehavior = "fail"; }

		return res;
	}

	if (selected.length >= 1 || autoActive) {
		let data = null, iDesc: IDescriptor[] = [];

		if (selected.length >= 1) {
			iDesc = selected;
		} else if (autoActive) {
			iDesc = [autoActive];
		}
		if (iDesc.some(item => item.originalReference.data.some(subitem => subitem.content.value === "reply" || subitem.content.value === "dispatch"))) {
			return "// Alchemist can't generate code from replay reply and dispatched code";
		}
		data = iDesc.map(item => addPerItemOptions(item));
		// adds raw data type support
		data = cloneDeep(data);
		
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			RawDataConverter.convertFakeRawInCode(item,descOptions);
		}
		
		let str = JSON.stringify(data, null, 3);
		const commandOptions = addCommonOptions(iDesc);
		
		str = str.replace(/"\$\$\$Left_/gm, "");
		str = str.replace(/_Right\$\$\$"/gm, "");
		str =
			"const batchPlay = require(\"photoshop\").action.batchPlay;\n" +
				"\n" +
				"const result =" + (commandOptions.synchronousExecution ? "" : " await") + " batchPlay(\n" +
				str +

				"," + JSON.stringify(commandOptions, null, 3) + ");\n";
	
		if (treePath.length) {
			// eslint-disable-next-line quotes
			str = `${str}const pinned = result${makeNicePropertyPath(treePath)};`;
		}
		return str;
	} else {
		return "Add some descriptor";
	}
});

export const getCodeContentTab = createSelector([all], t => {
	return t.inspector.code;
});

export const getCodeActiveView = createSelector([getCodeContentTab], t => {
	return t.viewType;
});