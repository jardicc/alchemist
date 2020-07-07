import { IDescriptor, TActiveTargetReferenceArr } from "../reducers/initialStateInspector";
import photothop from "photoshop";
import { cloneDeep } from "lodash";

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

export class GetInfo {
	
	public static async getAM(t: TActiveTargetReferenceArr|undefined): Promise<IDescriptor | null> {
		if (!t) { return null;}
		t = cloneDeep(t);
		const desc: ITargetReferenceAM = {
			"_obj": "get",
			"_target": []
		};
		const rootT = desc._target;

		switch (t.type) {
			case "action": {

				if (t.data.command !== "undefined") {
					rootT.push({
						"_ref": "command",
						"_name": t.data.command
					});
				}
				if (t.data.action !== "undefined") {
					rootT.push({
						"_ref": "action",
						"_name": t.data.action
					});
				}
				if (t.data.actionset !== "undefined") {
					rootT.push({
						"_ref": "actionset",
						"_name": t.data.actionset
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
				
				break;
			}
			case "customDescriptor": {
				
				break;
			}
			case "path": {
				const activeID = await this.getActivePathID();
				if (activeID === null) { return null; }

				if ((activeID === "vectorMask" || activeID === "workPathIndex")) {
					rootT.push({
						_enum: "path",
						_ref: "path",
						_value: activeID
					});
				} else if (typeof t.data.path === "number" || t.data.path === "active") {
					rootT.push({
						"_ref": "path",
						"_id": t.data.path === "active" ? activeID : t.data.path
					});
				}
				break;
			}
			case "history": {
				const activeID = await this.getActiveHistoryID();
				if (activeID === null || t.data.history === "undefined") { return null; }
				rootT.push({
					"_ref": "historyState",
					"_id": t.data.history === "active" ? activeID : t.data.history
				});
				break;
			}
			case "snapshot": {
				const activeID = await this.getActiveSnapshotID();
				if (activeID === null || t.data.snapshot === "undefined") { return null; }
				rootT.push({
					"_ref": "snapshotClass",
					"_id": t.data.snapshot === "active" ? activeID : t.data.snapshot
				});
				break;
			}
		}

		if (("document" in t.data) && t.data.document !== "undefined" && (t.data.document === "active" || typeof t.data.document === "number")) {
			const activeID = await this.getActiveDocumentID();
			if (activeID === null) { return null;}
			
			if (t.type !== "history" && t.type !== "snapshot") {
				rootT.push({
					"_ref": "document",
					"_id": t.data.document === "active" ? activeID : t.data.document
				});
			}
		}

		if (("layer" in t.data)  && (t.data.layer === "active" || typeof t.data.layer === "number")) {
			const activeID = await this.getActiveLayerID();
			if (activeID === null) { return null;}
			
			if (t.type !== "path" || (t.type === "path" && t.data.path === "vectorMask")) {
				rootT.push({
					"_ref": "layer",
					"_id": t.data.layer === "active" ? activeID : t.data.layer
				});				
			}
		}


		// add property when demanded by user
		if (("property" in t.data) && t.data.property !== "undefined" && t.data.property !== "notSpecified" && t.data.property !== "anySpecified" && typeof t.data.property === "string") {
			rootT.push({
				"_property": t.data.property
			});
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

	public static async getActiveLayerID(): Promise<number | null> {
		const result = await this.getProperty("layerID", "layer");
		if ("layerID" in result) {
			return result.layerID as number;
		}
		return null;
	}

	public static async getActiveChannelID(): Promise<number | null> {
		const result = await this.getProperty("ID", "channel");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
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
		const pathKind = (await GetInfo.getProperty("kind", "path"))._value;
		if (pathKind === "workPathIndex" || pathKind === "vectorMask") {
			return pathKind;
		}
		const result = await GetInfo.getProperty("ID", "path");
		if ("ID" in result) {
			return result.ID as number;
		}
		return null;
	}

	private static async getProperty(property: string, myClass: "application" | "channel" | "document" | "guide" | "historyState" | "snapshotClass" | "layer" | "path") {
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

