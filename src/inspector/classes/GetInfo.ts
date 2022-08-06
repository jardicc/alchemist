import photoshop from "photoshop";
import { cloneDeep } from "lodash";
import { IDescriptor, TChannelReferenceValid, ITargetReference } from "../model/types";
import { DocumentExtra } from "./DocumentExtra";
import { getName } from "./GetName";
import { getInitialState } from "../inspInitialState";
import { RawDataConverter } from "./RawDataConverter";
import { str as crc } from "crc-32";
import { batchPlaySync } from "../../shared/helpers";
import { ActionDescriptor } from "photoshop/dom/CoreModules";
const PS = photoshop.app;


export interface ITargetReferenceAM {
	"_obj": string,
	"_target": TReference[]
	"expandSmartObjects"?: boolean,
	"getTextStyles"?: boolean,
	"getFullTextStyles"?: boolean,
	"getDefaultLayerFX"?: boolean,
	"layerID"?: number,
	"getCompLayerSettings"?: boolean,
	"getPathData"?: boolean,
	"imageInfo"?: boolean,
	"compInfo"?: boolean,
	"layerInfo"?: boolean,
	"includeAncestors"?: boolean,
	[prop: string]: any;
}

export type TReference = INameReference | IDReference | IPropertyReference | IEnumReference|IndexReference

export interface IDReference{
	"_ref": string,
	"_id": number
}

export interface IndexReference{
	"_ref": string,
	"_index": number
}

export interface INameReference{
	"_ref": string,
	"_name": string
}

export interface IPropertyReference{
	"_property": string
}

export interface IEnumReference{
	"_ref": string
	"_enum": string
	"_value": string
}

export class GetInfo {
	
	public static async getAM(originalRef: ITargetReference | null): Promise<IDescriptor | null> {
		if (!originalRef) { return null;}
		const t = cloneDeep(originalRef);
		if (t.type === "generator") {
			const result = await this.getFromGenerator(originalRef);
			return result;
		}
		
		const desc: ITargetReferenceAM = {
			"_obj": "get",
			"_target": [],
		};
		const rootT = desc._target;

		const doc = t.data.find(i => i.subType === "document");		
		const layer = t.data.find(i => i.subType === "layer");		
		const channel = t.data.find(i => i.subType === "channel");		
		const path = t.data.find(i => i.subType === "path");		

		const guide = t.data.find(i => i.subType === "guide");		
		const history = t.data.find(i => i.subType === "history");		
		const snapshot = t.data.find(i => i.subType === "snapshot");		
		
		const action = t.data.find(i => i.subType === "action");		
		const actionset = t.data.find(i => i.subType === "actionset");		
		const command = t.data.find(i => i.subType === "command");		

		const property = t.data.find(i => i.subType === "property");		

		if (doc) {
			const activeID = await this.getActiveDocumentID();
			if (activeID === null) { return null;}
			
			if (t.type !== "history" && t.type !== "snapshot") {
				rootT.push({
					"_ref": "document",
					"_id": doc.content.value === "active" ? activeID : parseInt(doc.content.value as string),
				});
			}
		}
		if (t.type === "layer" || t.type === "path" || t.type === "channel") {
			const activeID = await this.getActiveLayerID();
			if (activeID === null) { return null; }
			
			if (
				(t.type === "layer") ||
				(t.type === "path" && path?.content.value === "vectorMask") ||
				(t.type == "channel" && (channel?.content.value === "filterMask" || channel?.content.value === "mask"))
			) {
				rootT.push({
					"_ref": "layer",
					"_id": layer?.content.value === "active" ? activeID : parseInt(layer?.content.value as string),
				});
			}
		}

		switch (t.type) {
			case "action": {

				if (typeof actionset?.content?.value === "string") {
					rootT.push({
						"_ref": "actionSet",
						"_id": parseInt(actionset.content.value), // TODO get index based on ID
					});
				}
				if (typeof action?.content?.value === "string") {
					rootT.push({
						"_ref": "action",
						"_id": parseInt(action.content.value),
					});
				}
				if (typeof command?.content?.value === "string" && typeof action?.content?.value === "string") {
					rootT.push({
						"_ref": "command",
						"_index": this.getActionCommandIndexByID(parseInt(command.content.value),parseInt(action.content.value)),
					});
				}

				break;
			}
			case "application": {
				rootT.push({
					"_ref": "application",
					"_enum": "ordinal",
					"_value": "targetEnum",
				});
				break;
			}
			case "timeline": {
				rootT.push({
					"_ref": "timeline",
					"_enum": "ordinal",
					"_value": "targetEnum",
				});
				break;
			}
			case "animationFrame": {
				rootT.push({
					"_ref": "animationFrameClass",
					"_enum": "ordinal",
					"_value": "targetEnum",
				});
				break;
			}
			case "animation": {
				rootT.push({
					"_ref": "animationClass",
					"_enum": "ordinal",
					"_value": "targetEnum",
				});
				break;
			}
			case "channel": {
				const activeID = await this.getActiveChannelID();
				if (activeID === null) { return null; }
				if (!channel?.content?.value) { return null;}

				if (channel.content.value === "active") {
					if (typeof activeID === "number") {
						rootT.push({
							"_ref": "channel",
							"_index": activeID,
						});						
					} else {
						rootT.push({
							_enum: "channel",
							_ref: "channel",
							_value: activeID,
						});
					}
				} else if (Number.isInteger(parseInt(channel.content.value))) {
					let docInstance: DocumentExtra;
					if (!doc?.content) { return null;}
					if (doc.content.value === "active") {
						docInstance = new DocumentExtra(PS.activeDocument);
					} else {
						docInstance = new DocumentExtra(new PS.Document(parseInt(doc.content.value as string)));
					}
					const found = docInstance.userChannelIDsAndNames.find(item => item.value.toString() === channel.content.value);
					if (!found) { return null;}
					rootT.push({
						"_ref": "channel",
						"_index": found.index,
					});	
				} else if (typeof channel.content.value === "string") {
					rootT.push({
						_enum: "channel",
						_ref: "channel",
						_value: channel.content.value,
					});
				}
				break;
			}
			case "path": {
				const activeID = await this.getActivePathID();
				if (activeID === null) { return null; }

				if (activeID === "vectorMask") {
					rootT.push({
						_enum: "path",
						_ref: "path",
						_value: activeID,
					});
				} else if (activeID === "workPathIndex") {
					rootT.push({
						"_property": "workPath",
						"_ref": "path",
					});
				} else if (typeof path?.content.value === "string") {
					rootT.push({
						"_ref": "path",
						"_id": path?.content.value === "active" ? activeID : parseInt(path?.content.value as string),
					});
				}
				break;
			}
			case "history": {
				const activeID = await this.getActiveHistoryID();
				if (activeID === null) { return null; }
				rootT.push({
					"_ref": "historyState",
					"_id": history?.content.value === "active" ? activeID : parseInt(history?.content.value as string),
				});
				break;
			}
			case "snapshot": {
				const activeID = await this.getActiveSnapshotID();
				if (activeID === null) { return null; }
				rootT.push({
					"_ref": "snapshotClass",
					"_id": snapshot?.content.value === "active" ? activeID : parseInt(snapshot?.content.value as string),
				});
				break;
			}
			case "guide": {
				rootT.push({
					"_ref": "guide",
					"_id": parseInt(guide?.content.value as string),
				});
				break;
			}
		}


		// add property when demanded by user
		if ((property) && property.content.value !== "notSpecified" && property.content.value !== "anySpecified" && typeof property.content.value === "string") {
			rootT.push({
				"_property": property.content.value,
			});
		}

		desc._target.reverse();
		console.log("Get", desc);
		const startTime = Date.now();
		const playResult = await photoshop.action.batchPlay([desc], {});
		return this.buildReply(startTime, playResult, desc,originalRef);
	}

	public static generateTitle = (originalReference:ITargetReference, calculatedReference:ITargetReferenceAM, reply=false, reference=false): string => {
		switch (originalReference.type) {
			case "replies": {
				return "Reply: " + calculatedReference._obj;
			}
			case "listener":
			case "notifier": {
				return calculatedReference._obj;
			}
		}
		const parts = getName(calculatedReference._target);
		//parts.push(...subs.map(d => d.subType + ": " + d.content.value));
		const names = parts.map(p => /*p.typeTitle +*/ ((p.value) ? (/*": "*/ p.value) : p.typeTitle));
		return names.join(" / ");
	}

	private static buildReply(startTime:number,playResult:ActionDescriptor[],desc: ITargetReferenceAM, originalRef: ITargetReference):IDescriptor {
		return {
			startTime,
			endTime: Date.now(),
			id: this.uuidv4(),
			locked: false,
			crc: crc(JSON.stringify(playResult)),
			originalData: RawDataConverter.replaceArrayBuffer(playResult),
			originalReference: originalRef,
			pinned: false,
			selected: false,
			calculatedReference: desc,
			renameMode: false,
			title: this.generateTitle(originalRef, desc),
			descriptorSettings: getInitialState().settings.initialDescriptorSettings,
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static async getFromGenerator(originalRef: ITargetReference): Promise<any>{
		const startTime = Date.now();
		const id = await this.getActiveDocumentID();
		if (id === null) {
			return null;
		}
		const desc:ITargetReferenceAM = {
			"_obj": "get",
			"_target": [
				{
					"_property": "json",
				}, {
					"_ref": "document",
					"_id": id,
				},
			],
			"expandSmartObjects": true,
			"getTextStyles": true,
			"getFullTextStyles": true,
			"getDefaultLayerFX": true,
			"layerID": 0,
			"getCompLayerSettings": true,
			"getPathData": true,
			"imageInfo": true,
			"compInfo": true,
			"layerInfo": true,
			"includeAncestors": true,
		};
		const playResult = await photoshop.action.batchPlay([desc], {});
		playResult.forEach(d => d.json = JSON.parse(d.json));
		return this.buildReply(startTime, playResult, desc,originalRef);
	}

	public static get historyCount(): number{
		//return this.getPropertySync("numberOfGuides"); TODO
		const desc = {
			_obj: "get",
			_target: [
				{
					"_ref": "historyState",
					"_property": "currentHistoryState",
				},
			],
		};
		const result = batchPlaySync([
			desc,
		]);
		return result[0].count;
	}

	public static getHistory():{value:number,label:string,snapshot:boolean}[] {
		const len = this.historyCount;
		const desc: ActionDescriptor[] = [];
		for (let i = 1; i <= len; i++){
			desc.push({
				_obj: "get",
				_target: [
					{
						"_ref": "historyState",
						"_index": i,
					},
				],
			});
		}

		const desResult = batchPlaySync(desc);

		const pairs = desResult.map((d) => ({
			value: d.ID,
			label: d.name,
			snapshot: !d.auto,
		}));
	
		return pairs;
	}

	public static async getActiveLayerID(): Promise<number | null> {
		const result = await this.getProperty("layerID", "layer");
		if ("layerID" in result) {
			return result.layerID as number;
		}
		return null;
	}

	public static getActionCommandIndexByID(commandID:number,actionItemID: number):number {
		const all = this.getAllCommandsOfAction(actionItemID);
		const found = all.find(desc => desc.ID === commandID);
		if (!found) {
			return NaN;
		}
		return found.itemIndex;
	}

	public static getAllCommandsOfAction(actionItemID: number):ActionDescriptor[] {
		console.log("action command");
		const action = new PS.Action(actionItemID);

		const desc = {
			_obj: "get",
			_target: [
				{
					"_ref": "action",
					"_id": action.id,
				},
				{
					"_ref": "actionSet",
					"_id": action.parent.id,
				},
			],
		};
		const result = batchPlaySync([
			desc,
		]);

		
		const childCount = result[0].numberOfChildren;
		const desc2: ActionDescriptor[] = [];
		for (let i = 1; i <= childCount; i++){
			desc2.push({
				_obj: "get",
				_target: [
					{
						"_ref": "command",
						"_index": i, // get index based on ID
					},
					{
						"_ref": "action",
						"_id": action.id,
					},
					{
						"_ref": "actionSet",
						"_id": action.parent.id,
					},
				],
			});
		}
		const result2 = batchPlaySync(desc2);
		return result2;
	}

	public static async getActiveChannelID(): Promise<number | null | TChannelReferenceValid> {
		
		const resultItemIndex = await this.getProperty("itemIndex", "channel");
		if ("itemIndex" in resultItemIndex) {
			return resultItemIndex.itemIndex as number;
		}

		const itemIndex = (await this.getProperty("itemIndex", "channel")).itemIndex;
		const mode = await this.getActiveDocumentColorMode();
		switch (mode) {
			case "CMYKColorEnum":
				switch (itemIndex) {
					case 1: return "cyan";
					case 2: return "magenta";
					case 3: return "yellow";
					case 4: return "black";
				}
				break;
			case "RGBColor":
				switch (itemIndex) {
					case 1: return "red";
					case 2: return "green";
					case 3: return "blue";
				}
				break;
			case "labColor":
				switch (itemIndex) {
					case 1: return "lightness";
					case 2: return "a";
					case 3: return "b";
				}
				break;
			case "grayScale":
				switch (itemIndex) {
					case 1: return "gray";
				}
				break;
			default:
				return "RGB"; // can we return composite channel instead?
			
		}
		return "RGB"; // can we return composite channel instead?
	}

	public static async getActiveDocumentID(): Promise<number | null> {
		const result = await this.getProperty("documentID", "document");
		if ("documentID" in result) {
			return result.documentID as number;
		}
		return null;
	}

	public static async getActiveHistoryID(): Promise<number | null> {
		const result = await this.getProperty("ID", "historyState");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}

	public static async getActiveSnapshotID(): Promise<number | null> {
		const result = await this.getProperty("ID", "snapshotClass");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}

	public static async getActivePathID(): Promise<"vectorMask" | "workPathIndex" | number | null> {
		const pathKind = (await GetInfo.getProperty("kind", "path")).kind._value;
		if (pathKind === "workPathIndex" || pathKind === "vectorMask") {
			return pathKind;
		}
		const result = await GetInfo.getProperty("ID", "path");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}

	public static getBuildString(): string {

		const result = batchPlaySync([
			{
				"_obj": "get",
				"_target": [
					{
						"_property": "buildNumber",
					},
					{
						"_ref": "application",
						"_enum": "ordinal",
						"_value": "targetEnum",
					},
				],
			},
		]);

		return result?.[0]?.["buildNumber"] ?? "n/a";
	}

	public static async getProperty(property: string, myClass: "application" | "channel" | "document" | "guide" | "historyState" | "snapshotClass" | "layer" | "path"):Promise<ActionDescriptor> {
		const desc = {
			_obj: "get",
			_target: [
				{
					"_property": property,
				},
				{
					"_ref": myClass as string,
					"_enum": "ordinal",
					"_value": "targetEnum",
				},
			],
		};
		const result = await photoshop.action.batchPlay([
			desc,
		],{});
		return result[0];
	}

	private static async getActiveDocumentColorMode():Promise<"grayScale"|"RGBColor"|"HSBColorEnum"|"CMYKColorEnum"|"labColor"|"bitmap"|"indexedColor"|"multichannel"|"duotone"|"useICCProfile"> {
		const desc = {
			_obj: "get",
			_target: [
				{
					"_property": "mode",
				},
				{
					"_ref": "document",
					"_enum": "ordinal",
					"_value": "targetEnum",
				},
			],
		};
		const result = await photoshop.action.batchPlay([
			desc,
		],{});
		return result[0].mode._value;
	}

	public static uuidv4():string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
}

