import photoshop from "photoshop";
import {TDocumentReference, IContentWrapper, TLayerReference, TChannelReference, TPathReference, TActionSet, TActionItem, TActionCommand, TGuideReference, THistoryReference, IFilterProperty } from "../model/types";

import { DocumentExtra } from "./DocumentExtra";
import { GetInfo } from "./GetInfo";

const PS = photoshop.app;

export class GetList {
	public static async getDocuments(): Promise<IFilterProperty<TDocumentReference>[]> {
		console.log("get docs");
		const documents = PS.documents.map(d => new DocumentExtra(d));
		const docs = documents.map(async d => ({ value: d.id.toString(), label: await d.$title() }));
		const result = await Promise.all(docs);
		return result;
	}

	private static getDocumentExtra(arg: IContentWrapper<TDocumentReference>): DocumentExtra | null {
		let docID: number;
		if (arg.value === "active") {
			docID = PS?.activeDocument?.id;
		} else {
			docID = parseInt(arg.value);
		}
		if (!docID) { return null; }
		const docE = new DocumentExtra(new PS.Document(docID));
		return docE;
	}

	public static getLayers(arg: IContentWrapper<TDocumentReference>): IFilterProperty<TLayerReference>[] {
		const docE = this.getDocumentExtra(arg);
		if (!docE) { return []; }
		const layers = docE.layers.map(d => ({ value: d.id.toString(), label: d.name }));
		return layers;
	}

	public static getChannels(arg: IContentWrapper<TDocumentReference>): IFilterProperty<TChannelReference>[] {
		const docE = this.getDocumentExtra(arg);
		if (!docE) { return []; }
		const pairs: IFilterProperty<TChannelReference>[] = docE.userChannelIDsAndNames.map(p => ({ value: p.value.toString(), label: p.label })); // remove index
		return pairs;
	}

	public static getPaths(arg: IContentWrapper<TDocumentReference>): IFilterProperty<TPathReference>[] {
		const docE = this.getDocumentExtra(arg);
		if (!docE) { return []; }
		const pairs: IFilterProperty<TPathReference>[] = docE.userPathsIDsAndNames.map(p => ({ value: p.value.toString(), label: p.label }));
		return pairs;
	}

	public static getGuides(arg: IContentWrapper<TDocumentReference>): IFilterProperty<TGuideReference>[] {
		const docE = this.getDocumentExtra(arg);
		if (!docE) { return []; }
		const pairs: IFilterProperty<TPathReference>[] = docE.guidesIDs.map(p => ({ value: p.value.toString(), label: p.label }));
		return pairs;
	}
	public static getHistory(): IFilterProperty<THistoryReference>[] {
		const pairs = GetInfo.getHistory();
		const result: IFilterProperty<THistoryReference>[] = pairs.filter(p => p.snapshot === false).map(p => ({ value: p.value.toString(), label: p.label })); // remove snapshot
		return result;
	}

	public static getSnapshots(): IFilterProperty<THistoryReference>[] {
		const pairs = GetInfo.getHistory();
		const result: IFilterProperty<THistoryReference>[] = pairs.filter(p => p.snapshot === true).map(p => ({ value: p.value.toString(), label: p.label })); // remove snapshot
		return result;
	}

	public static getActionSets(): IFilterProperty<TActionSet>[] {
		const actionSets: IFilterProperty<TActionSet>[] = PS.actionTree.map(item => ({ value: item.id.toString(), label: item.name }));
		return actionSets;
	}

	public static getActionItem(actionSetID: number): IFilterProperty<TActionItem>[] {
		const actionSet = new PS.ActionSet(actionSetID);
		const action: IFilterProperty<TActionItem>[] = actionSet.actions.map(item => ({ value: item.id.toString(), label: item.name }));
		return action;
	}

	public static getActionCommand(actionItemID: number): IFilterProperty<TActionCommand>[] {
		const result2 = GetInfo.getAllCommandsOfAction(actionItemID);

		const final: IFilterProperty<TActionCommand>[] = result2.map(item => ({ value: item.ID.toString(), label: item.name }));
		return final;
	}
}