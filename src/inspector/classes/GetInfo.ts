import {app, action} from "photoshop";
import { cloneDeep } from "lodash";
import { IDescriptor, TAllTargetReferences} from "../model/types";
import { getName } from "./GetName";
import { getInitialState } from "../inspInitialState";
import { RawDataConverter } from "./RawDataConverter";
import { str as crc } from "crc-32";
import { batchPlaySync } from "../../shared/helpers";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
import {Reference, TReference} from "./Reference";
import {IDBySelected} from "./GetIDBySelected";
import {GetList} from "./GetList";
import {ReferenceToDOM} from "./GetDOM";


export interface ITargetReferenceAM {
	_obj: string,
	_target: TReference[]
	expandSmartObjects?: boolean,
	getTextStyles?: boolean,
	getFullTextStyles?: boolean,
	getDefaultLayerFX?: boolean,
	layerID?: number,
	getCompLayerSettings?: boolean,
	getPathData?: boolean,
	imageInfo?: boolean,
	compInfo?: boolean,
	layerInfo?: boolean,
	includeAncestors?: boolean,
	[prop: string]: any;
}

export class GetInfo {

	/** Does not include property */
	private static async getReference(_originalRef: TAllTargetReferences): Promise<Reference | null> {

		const ref = new Reference([]);
		const origRef = cloneDeep(_originalRef);

		// set document
		switch (origRef.type) {
			case "document":
			case "layer":
			case "channel":
			case "path":
			case "guide": {
				if (origRef.documentID === "all") {
					ref.setApplication();
					ref.allClass = "document";
				} else if (origRef.documentID === "selected") {
					const activeID = app.activeDocument?.id ?? null;
					if (activeID === null) {return null;}
					ref.setDocument(activeID);
				} else {
					ref.setDocument(origRef.documentID);
				}
				break;
			}
			default: {
				if ("documentID" in origRef) throw new Error(origRef.type);
			}
			
		}

		// set layer
		switch (origRef.type) {
			case "layer":
			case "channel":
			case "path": {
				if (origRef.type === "channel" && !(origRef.channelID === "filterMask" || origRef.channelID === "mask")) {
					break;
				}
				if (origRef.type === "path" && !(origRef.pathID === "vectorMask")) {
					break;
				}
				if (origRef.layerID === "none") {
					break;
				} else if (origRef.layerID === "all") {
					ref.allClass = "layer";
				} else if (origRef.layerID === "selected") {
					const activeID = await IDBySelected.layer();
					if (activeID === null) {return null;}
					ref.setLayer(activeID);
				} else {
					ref.setLayer(origRef.layerID);
				}
				break;
			}
			default: {
				if ("layerID" in origRef) throw new Error(origRef.type);
			}
		}

		switch (origRef.type) {
			case "actions": {

				if (origRef.actionSetID === "none") {
					return null;
				}

				let commandIndex: number | null = null;
				const actionIDs = origRef.actionID === "none" ? null : origRef.actionID;
				if (origRef.commandIndex !== "none" && origRef.actionID !== "none") {
					commandIndex = this.getActionCommandIndexByID(origRef.commandIndex, origRef.actionID);
				}
				if (origRef.actionSetID === "all") {
					ref.setApplication();
					ref.allClass = "actionSet";
					ref.setAction(undefined, actionIDs, commandIndex);
					break;
				}
				ref.setAction(origRef.actionSetID, actionIDs, commandIndex);
				break;
			}
			case "channel": {
				
				if (origRef.channelID === "all") {
					ref.allClass = "channel";
					break;
				}

				if (!ref.document) {throw new Error("It should have document reference");}

				if (origRef.channelID === "selected") {
					const activeID = await IDBySelected.channel(ref.document._id);
					if (activeID === null) {return null;}
					ref.setChannel(activeID);
				} else if (typeof origRef.channelID === "number") {
					ref.setChannel(origRef.channelID);
				} else {
					ref.setChannel(origRef.channelID);
				}
				break;
			}
			case "path": {
				if (origRef.pathID === "all") {
					ref.allClass = "path";
					break;
				}
				let pathV: number | "vectorMask" | "workPath";

				if (origRef.pathID === "selected") {
					const activeID = await IDBySelected.path(); // !! can be work path and mask
					if (activeID === null) {return null;}
					pathV = activeID;
				} else {
					pathV = origRef.pathID;
				}

				if (pathV === "vectorMask") {
					ref.setVectorMask();
				} else if (pathV === "workPath") {
					ref.setWorkPath();
				} else {
					ref.setPath(pathV);
				}
				break;
			}
			case "application": {
				ref.setApplication();
				break;
			}
			case "timeline": {
				ref.setTimeline();
				break;
			}
			case "animationFrameClass": {
				ref.setAnimationFrame();
				break;
			}
			case "animationClass": {
				ref.setAnimation();
				break;
			}
			case "historyState": {
				if (origRef.historyID === "selected") {
					const activeID = await IDBySelected.history();
					if (activeID === null) {return null;}
					ref.setSnapshot(activeID);
				} else {
					ref.setSnapshot(origRef.historyID);
				}
				break;
			}
			case "snapshotClass": {
				if (origRef.snapshotID === "selected") {
					const activeID = await IDBySelected.snapshot();
					if (activeID === null) {return null;}
					ref.setSnapshot(activeID);
				} else {
					ref.setSnapshot(origRef.snapshotID);
				}
				break;
			}
			case "guide": {
				if (origRef.guideID === "all") {
					ref.allClass = "guide";
					break;
				} else if (origRef.guideID === "none") {
					break;
				} else {
					ref.setGuide(origRef.guideID);
					break;
				}
			}
		}

		// Add properties
		if ("properties" in origRef) {
			origRef.properties.forEach(p => {
				if (p === "notSpecified") {
					return;
				}
				ref.addProperty(p);
			});
		}

		return ref;
	}
	
	public static async getAM(_originalRef: TAllTargetReferences | null): Promise<IDescriptor | null> {
		if (!_originalRef) {return null;}
		const origRef = cloneDeep(_originalRef);
		if (origRef.type === "generator") {
			const result = await this.getFromGenerator(_originalRef);
			return result;
		}

		const reference = await (GetInfo.getReference(origRef));

		if (!reference?.refsOnly?.length) {
			return null;
		}

		let descToPlay: ITargetReferenceAM;
		
		if (reference.propertiesOnly.length > 1 || reference.allClass) {

			const target = [...reference.refsOnly];

			// TODO make this range exceptions cleaner?
			const range = {_obj: reference.allClass, index: 1, count: -1};
			if (reference.allClass === "layer") {
				if (reference.document) {
					const hasBg = new app.Document(reference.document._id).backgroundLayer;
					if (hasBg) {
						range.index = 0;						
					}
				} else if(app.activeDocument.backgroundLayer){
					range.index = 0;
				}
			}
			if (reference.allClass === "path") {
				if (reference.document) {
					const doc = new app.Document(reference.document._id);
					range.count = doc.pathItems.length;						
				} else if(app.activeDocument){
					range.count = app.activeDocument.pathItems.length;
				} else {
					range.count = 0;
				}
			}

			descToPlay = {
				_obj: "multiGet",
				_target: target,
				extendedReference: [
					reference.propertiesOnly.map(p => p._property),
					// conditionally add range
					...(reference.allClass ? [range] : []),
				],
				options: {
					failOnMissingProperty: false,
					failOnMissingElement: true,
				},
			};
		} else {
			descToPlay = {
				_obj: "get",
				_target: reference.amCode,
			};
		}

		console.log("Get", descToPlay);
		const startTime = Date.now();
		const playResult = await action.batchPlay([descToPlay], {});
		return this.buildReply(startTime, playResult, descToPlay, _originalRef);
	}



	public static generateTitle = (originalReference: TAllTargetReferences | null, calculatedReference: ITargetReferenceAM): string => {
		if (!originalReference) {
			return "Error - autoinspector n/a";
		}
		switch (originalReference.type) {
			case "replies": {
				return "Reply: " + calculatedReference._obj;
			}
			case "listener": {

				let postfix = "";

				const target: any = calculatedReference._target || calculatedReference.null;
				if (Array.isArray(target)) {
					postfix += target.reduceRight((str, current) => {
						return (str + " " + current?._ref ?? "");
					}, "");
				} else {
					postfix += " " + (target?._ref ?? "");
				}

				const res = calculatedReference._obj + (postfix.trim() ? " (" + postfix.trim() + ")" : "");
				return res;
			}
			case "notifier": {
				return calculatedReference._obj;
			}
		}
		const parts = getName(calculatedReference._target);
		const names = parts.map(p => p.value ?? "N/A");
		return names.join(" / ");
	};

	private static buildReply(startTime: number, playResult: ActionDescriptor[], playAbleData: ITargetReferenceAM, originalRef: TAllTargetReferences): IDescriptor {
		return {
			startTime,
			endTime: Date.now(),
			id: crypto.randomUUID(),
			locked: false,
			crc: crc(JSON.stringify(playResult)),
			recordedData: RawDataConverter.replaceArrayBuffer(playResult),
			originalReference: originalRef,
			pinned: false,
			selected: false,
			playAbleData: playAbleData,
			renameMode: false,
			title: this.generateTitle(originalRef, playAbleData),
			descriptorSettings: getInitialState().settings.initialDescriptorSettings,
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static async getFromGenerator(originalRef: TAllTargetReferences): Promise<any> {
		const startTime = Date.now();
		const id = app.activeDocument?.id ?? null;
		if (id === null) {
			return null;
		}
		const desc: ITargetReferenceAM = {
			_obj: "get",
			_target: [
				{
					_property: "json",
				}, {
					_ref: "document",
					_id: id,
				},
			],
			expandSmartObjects: true,
			getTextStyles: true,
			getFullTextStyles: true,
			getDefaultLayerFX: true,
			layerID: 0,
			getCompLayerSettings: true,
			getPathData: true,
			imageInfo: true,
			compInfo: true,
			layerInfo: true,
			includeAncestors: true,
		};
		const playResult = await action.batchPlay([desc], {});
		playResult.forEach(d => d.json = JSON.parse(d.json));
		return this.buildReply(startTime, playResult, desc, originalRef);
	}

	private static getActionCommandIndexByID(commandID: number, actionItemID: number): number {
		const all = GetList.getAllCommandsOfAction(actionItemID);
		const found = all.find(desc => desc.ID === commandID);
		if (!found) {
			return NaN;
		}
		return found.itemIndex;
	}

	public static getBuildString(): string {

		const result = batchPlaySync([
			{
				_obj: "get",
				_target: [
					{
						_property: "buildNumber",
					},
					{
						_ref: "application",
						_enum: "ordinal",
						_value: "targetEnum",
					},
				],
			},
		]);

		return result?.[0]?.["buildNumber"] ?? "n/a";
	}
}

