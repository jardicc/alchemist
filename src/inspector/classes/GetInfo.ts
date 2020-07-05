import { TTargetReference, TActiveTargetReference, ITargetReferenceAction, ITargetReferenceHistory, ITargetReferenceSnapshot, IDescriptor } from "../reducers/initialStateInspector";
import photothop from "photoshop";

export interface ITargetReferenceAM{
	"_obj": "get",
	"_target": TReference[]
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

export class GetInfo{
	
	public static async getAM(activeType: TTargetReference, t: TActiveTargetReference):Promise<IDescriptor|null> {
		const desc: ITargetReferenceAM = {
			"_obj": "get",
			"_target": []
		};

		const rootT = desc._target;
		//const activeDocument = await this.getActiveDocumentID();
		//const activeLayer = await this.getActiveLayerID();
		//const activeChannel = await this.getActiveChannelID();
		//const activePath  = await this.getActivePathID();
		//const activeHistory = await this.getActiveHistoryID();
		//const activeSnapshot = await this.getActiveSnapshotID();
		
		// add property when demanded by user

		if (t && ("document" in t) && t.document !== "undefined" && (t.document === "active" || typeof t.document === "number")) {
			const activeID = await this.getActiveDocumentID();
			if (activeID === null) {return null;}
			rootT.push({
				"_ref": "document",
				"_id":t.document === "active" ?   activeID: t.document
			});			
		}

		if (t && ("layer" in t) && t.layer !== "undefined" && (t.layer === "active" || typeof t.layer === "number")) {
			const activeID = await this.getActiveLayerID();
			if (activeID === null) {return null;}
			rootT.push({
				"_ref": "layer",
				"_id":t.layer === "active" ?   activeID: t.layer
			});			
		}

		if (t && ("property" in t) && t.property !== "undefined" && t.property !=="notSpecified"  && t.property !=="anySpecified"  && typeof t.property === "string") {
			rootT.push({
				"_property": t.property
			});			
		}

		switch (activeType) {
			case "action": {
				const target = (t as ITargetReferenceAction);

				if (target.command !== "undefined") {
					rootT.push({
						"_ref": "command",
						"_name": target.command
					});				
				}
				if (target.action !== "undefined") {
					rootT.push({
						"_ref": "action",
						"_name": target.action
					});				
				}
				if (target.actionset !== "undefined") {
					rootT.push({
						"_ref": "actionset",
						"_name": target.actionset
					});
				}
				break;				
			}
			case "allFromGenerator": {
				
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
				
				break;
			}
			case "customDescriptor": {
				
				break;
			}
			case "featureData": {
				
				break;
			}
			case "history": {
				const target = (t as ITargetReferenceHistory);

				rootT.push({
					_ref: "historyState",
					_id: 0,
				});
				break;
			}
			case "snapshot": {
				const target = (t as ITargetReferenceSnapshot);
				rootT.push({
					_ref: "snapshotClass",
					_id: 0,
				});
				break;
			}
			case "path": {
				
				break;
			}
		}
		desc._target.reverse();
		const startTime = Date.now();
		const playResult = await photothop.action.batchPlay([desc], {});
		return {
			startTime,
			endTime: Date.now(),
			id: this.uuidv4(),
			locked: false,
			originalData: playResult,
			originalReference: desc,
			pinned: false,
			selected: false,

		};
	}

	public static async getActiveLayerID():Promise<number|null> {
		const result = await this.createSelectedRef("layerID", "layer");
		if ("layerID" in result) {
			return result.layerID as number;
		}
		return null;
	}
	public static async getActiveChannelID():Promise<number|null> {
		const result = await this.createSelectedRef("ID", "channel");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}
	public static async getActiveDocumentID():Promise<number|null> {
		const result = await this.createSelectedRef("documentID", "document");
		if ("documentID" in result) {
			return result.documentID as number;
		}
		return null;
	}
	public static async getActivePathID():Promise<number|null> {
		const result = await this.createSelectedRef("ID", "path");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}
	public static async getActiveHistoryID():Promise<number|null> {
		const result = await this.createSelectedRef("ID", "historyState");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}
	public static async getActiveSnapshotID():Promise<number|null> {
		const result = await this.createSelectedRef("ID", "snapshotClass");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}

	private static async createSelectedRef(property: string, myClass: "application" | "channel" | "document" | "guide" | "historyState" | "snapshotClass" | "layer" | "path") {
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
		const result = await photothop.action.batchPlay([
			desc
		],{});
		return result[0];
	}

	private static uuidv4():string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
}

