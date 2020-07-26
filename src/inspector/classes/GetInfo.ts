
import photoshop from "photoshop";
import { cloneDeep } from "lodash";
import { IDescriptor, TChannelReferenceValid, ITargetReference } from "../model/types";
import { Descriptor } from "photoshop/dist/types/UXP";


export interface ITargetReferenceAM {
	"_obj": "get",
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
}

export type TReference = INameReference | IDReference | IPropertyReference | IEnumReference

export interface IDReference{
	"_ref": string,
	"_id": number
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
	
	public static async getAM(originalRef: ITargetReference|null): Promise<IDescriptor | null> {
		if (!originalRef) { return null;}
		const t = cloneDeep(originalRef);
		if (t.type === "generator") {
			const result = await this.getFromGenerator(originalRef);
			return result;
		}
		
		const desc: ITargetReferenceAM = {
			"_obj": "get",
			"_target": []
		};
		const rootT = desc._target;

		const doc = t.data.find(i => i.subType === "document");		
		const layer = t.data.find(i => i.subType === "layer");		
		const channel = t.data.find(i => i.subType === "channel");		
		const path = t.data.find(i => i.subType === "path");		

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
					"_id": doc.content.value === "active" ? activeID : doc.content.value as number
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
					"_id": layer?.content.value === "active" ? activeID : layer?.content.value as number
				});
			}
		}

		switch (t.type) {
			case "action": {

				if (command?.content.value !== null) {
					rootT.push({
						"_ref": "command",
						"_name": command?.content.value as string
					});
				}
				if (action?.content.value !== null) {
					rootT.push({
						"_ref": "action",
						"_name": action?.content.value as string
					});
				}
				if (actionset?.content.value !== null) {
					rootT.push({
						"_ref": "actionset",
						"_name": actionset?.content.value as string
					});
				}
				break;
			}
			case "application": {
				rootT.push({
					"_ref": "application",
					"_enum": "ordinal",
					"_value": "targetEnum"
				});
				break;
			}
			case "channel": {
				const activeID = await this.getActiveChannelID();
				if (activeID === null) { return null; }

				if (channel?.content.value === "active") {
					if (typeof activeID === "number") {
						rootT.push({
							"_ref": "channel",
							"_id": activeID
						});						
					} else {
						rootT.push({
							_enum: "channel",
							_ref: "channel",
							_value: activeID
						});
					}
				} else if (typeof channel?.content.value === "number") {
					rootT.push({
						"_ref": "channel",
						"_id": channel?.content.value
					});	
				} else if (typeof channel?.content.value === "string") {
					rootT.push({
						_enum: "channel",
						_ref: "channel",
						_value: channel?.content.value
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
						_value: activeID
					});
				} else if (activeID === "workPathIndex") {
					rootT.push({
						"_property": "workPath",
						"_ref": "path"
					});
				} else if (typeof path?.content.value === "number" || path?.content.value === "active") {
					rootT.push({
						"_ref": "path",
						"_id": path?.content.value === "active" ? activeID : path?.content.value
					});
				}
				break;
			}
			case "history": {
				const activeID = await this.getActiveHistoryID();
				if (activeID === null) { return null; }
				rootT.push({
					"_ref": "historyState",
					"_id": history?.content.value === "active" ? activeID : history?.content.value as number
				});
				break;
			}
			case "snapshot": {
				const activeID = await this.getActiveSnapshotID();
				if (activeID === null) { return null; }
				rootT.push({
					"_ref": "snapshotClass",
					"_id": snapshot?.content.value === "active" ? activeID : snapshot?.content.value as number
				});
				break;
			}
		}


		// add property when demanded by user
		if ((property) && property.content.value !== "notSpecified" && property.content.value !== "anySpecified" && typeof property.content.value === "string") {
			rootT.push({
				"_property": property.content.value
			});
		}

		desc._target.reverse();
		console.log("Get", desc);
		const startTime = Date.now();
		const playResult = await photoshop.action.batchPlay([desc], {});
		return this.buildReply(startTime, playResult, desc,originalRef);
	}

	private static buildReply(startTime:number,playResult:Descriptor[],desc: ITargetReferenceAM, originalRef: ITargetReference):IDescriptor {
		return {
			startTime,
			endTime: Date.now(),
			id: this.uuidv4(),
			locked: false,
			originalData: playResult,
			originalReference: originalRef,
			pinned: false,
			selected: false,
			calculatedReference: desc
		};
	}

	private static async getFromGenerator(originalRef: ITargetReference): Promise<any>{
		const startTime = Date.now();
		const desc:ITargetReferenceAM = {
			"_obj": "get",
			"_target": [
				{
					"_property": "json"
				}, {
					"_ref": "document",
					"_enum": "ordinal",
					"_value": "targetEnum"
				}
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

	public static async getActiveLayerID(): Promise<number | null> {
		const result = await this.getProperty("layerID", "layer");
		if ("layerID" in result) {
			return result.layerID as number;
		}
		return null;
	}

	public static async getActiveChannelID(): Promise<number | null | TChannelReferenceValid> {
		
		const resultID = await this.getProperty("ID", "channel");
		if ("ID" in resultID) {
			return resultID.ID as number;
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

	public static async getProperty(property: string, myClass: "application" | "channel" | "document" | "guide" | "historyState" | "snapshotClass" | "layer" | "path") {
		const desc = {
			_obj: "get",
			_target: [
				{
					"_property": property
				},
				{
					"_ref": myClass as string,
					"_enum": "ordinal",
					"_value": "targetEnum"
				}
			]
		};
		const result = await photoshop.action.batchPlay([
			desc
		],{});
		return result[0];
	}

	private static async getActiveDocumentColorMode():Promise<"grayScale"|"RGBColor"|"HSBColorEnum"|"CMYKColorEnum"|"labColor"|"bitmap"|"indexedColor"|"multichannel"|"duotone"|"useICCProfile"> {
		const desc = {
			_obj: "get",
			_target: [
				{
					"_property": "mode"
				},
				{
					"_ref": "document",
					"_enum": "ordinal",
					"_value": "targetEnum"
				}
			]
		};
		const result = await photoshop.action.batchPlay([
			desc
		],{});
		return result[0].mode._value;
	}

	private static uuidv4():string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	public static getDom(ref: TReference[]) {

		const res: IDReference[] = ref?.filter(v => ("_ref" in v)) as IDReference[];
		if (!res) {
			return null;
		}

		if (res[0]._ref === "application") {
			return GetInfo.getAppDom();
		}

		if (res[0]._ref === "layer") {
			return GetInfo.getLayerDom(res[1]._id, res[0]._id);
		}

		if (res[0]._ref === "document") {
			return GetInfo.getDocumentDom(res[0]._id);
		}
		return null;
	}

	public static getAppDom() {
		const appDom = new photoshop.app.Photoshop();
		return appDom;
	}

	public static getLayerDom(doc:number,num:number) {
		const layerDom = new photoshop.app.Layer(num, doc);
		return layerDom;
	}

	public static getDocumentDom(doc: number) {
		const docDom = new photoshop.app.Document(doc);
		return docDom;
	}
}

