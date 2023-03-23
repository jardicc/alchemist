import {app} from "photoshop";
import {ActionDescriptor} from "photoshop/dom/CoreModules";
import {batchPlaySync} from "../../shared/helpers";
import {
	TDocumentReference, TLayerReference, TChannelReference,
	TPathReference, TActionSet, TActionItem, TActionCommand, TGuideReference,
	THistoryReference, IFilterProperty,
} from "../model/types";

import { DocumentExtra } from "./DocumentExtra";


export class GetList {
	public static async getDocuments(): Promise<IFilterProperty<TDocumentReference>[]> {
		console.log("get docs");
		const documents = app.documents.map(d => new DocumentExtra(d));
		const docs = documents.map(async d => ({
			value: d.id,
			label: await d.$title(),
		}));
		const result = await Promise.all(docs);
		return result;
	}

	public static getLayers(docID: number | "selected"): IFilterProperty<TLayerReference>[] {
		const docE = this.getDocumentExtra(docID);
		if (!docE) {return [];}
		const layers = docE.allLayers.reverse().map(d => ({
			value: d.layerID,
			label: `${d.name} (${d.layerID})`,
		}));
		return layers;
	}

	public static getChannels(docID: number | "selected"): IFilterProperty<TChannelReference>[] {
		const docE = this.getDocumentExtra(docID);
		if (!docE) {return [];}
		const pairs: IFilterProperty<TChannelReference>[] = docE.userChannelIDsAndNames.map(p => ({
			value: p.value,
			label: p.label,
		})); // remove index
		return pairs;
	}

	public static getPaths(docID: number | "selected"): IFilterProperty<TPathReference>[] {
		const docE = this.getDocumentExtra(docID);
		if (!docE) {return [];}
		const pairs: IFilterProperty<TPathReference>[] = docE.userPathsIDsAndNames.map(p => ({
			value: p.value,
			label: p.label,
		}));
		return pairs;
	}

	public static getGuides(docID: number | "selected"): IFilterProperty<TGuideReference>[] {
		const docE = this.getDocumentExtra(docID);
		if (!docE) {return [];}
		const pairs: IFilterProperty<TGuideReference>[] = docE.guidesIDs.map(p => ({
			value: p.value,
			label: p.label,
		}));
		return pairs;
	}
	public static getHistory(): IFilterProperty<THistoryReference>[] {
		const pairs = this.getHistoryList();
		const result: IFilterProperty<THistoryReference>[] = pairs.filter(p => !p.snapshot).map(p => ({
			value: p.value,
			label: p.label,
		})); // remove snapshot
		return result;
	}

	public static getSnapshots(): IFilterProperty<THistoryReference>[] {
		const pairs = this.getHistoryList();
		const result: IFilterProperty<THistoryReference>[] = pairs.filter(p => p.snapshot).map(p => ({
			value: p.value,
			label: p.label,
		})); // remove snapshot
		return result;
	}

	public static getActionSets(): IFilterProperty<TActionSet>[] {
		const actionSets: IFilterProperty<TActionSet>[] = app.actionTree.map(item => ({
			value: item.id,
			label: item.name,
		}));
		return actionSets;
	}

	public static getActionItem(actionSetID: number): IFilterProperty<TActionItem>[] {
		if (Number.isNaN(actionSetID)) {
			return [];
		}
		const actionSet = new app.ActionSet(actionSetID);
		const action: IFilterProperty<TActionItem>[] = actionSet.actions.map(item => ({
			value: item.id,
			label: item.name,
		}));
		return action;
	}

	public static getActionCommands(actionItemID: number): IFilterProperty<TActionCommand>[] {
		if (Number.isNaN(actionItemID)) {
			return [];
		}
		const result2 = this.getAllCommandsOfAction(actionItemID);

		const final: IFilterProperty<TActionCommand>[] = result2.map(item => ({
			value: item.ID,
			label: item.name,
		}));
		return final;
	}

	// active document only
	public static getHistoryList(): {value: number, label: string, snapshot: boolean}[] {
		const len = this.historyCount;
		const desc: ActionDescriptor[] = [];
		for (let i = 1; i <= len; i++) {
			desc.push({
				_obj: "get",
				_target: [
					{
						_ref: "historyState",
						_index: i,
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

	public static getAllCommandsOfAction(actionItemID: number):ActionDescriptor[] {
		console.log("action command");
		const action = new app.Action(actionItemID);

		const desc = {
			_obj: "get",
			_target: [
				{
					_ref: "action",
					_id: action.id,
				},
				{
					_ref: "actionSet",
					_id: action.parent.id,
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
						_ref: "command",
						_index: i, // get index based on ID
					},
					{
						_ref: "action",
						_id: action.id,
					},
					{
						_ref: "actionSet",
						_id: action.parent.id,
					},
				],
			});
		}
		const result2 = batchPlaySync(desc2);
		return result2;
	}

	// PRIVATE

	private static getDocumentExtra(docID: number | "selected"): DocumentExtra | null {
		let res: number;
		if (docID === "selected") {
			res = app?.activeDocument?.id;
		} else {
			res = docID;
		}
		if (!docID) {return null;}
		const docE = new DocumentExtra(new app.Document(res));
		return docE;
	}

	private static get historyCount(): number{
		//return this.getPropertySync("numberOfGuides"); TODO
		const desc = {
			_obj: "get",
			_target: [
				{
					_ref: "historyState",
					_property: "currentHistoryState",
				},
			],
		};
		const result = batchPlaySync([
			desc,
		]);
		return result[0].count;
	}


}