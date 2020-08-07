import photoshop from "photoshop";
import {TDocumentReference, IContentWrapper, TLayerReference, TChannelReference, TPathReference, TActionSet, TActionItem, TActionCommand, TGuideReference, THistoryReference } from "../model/types";
import { IProperty } from "../components/LeftColumn/LeftColumn";
import { DocumentExtra } from "./DocumentExtra";
import { GetInfo } from "./GetInfo";

const PS = photoshop.app;

export class GetList{
	public static async getDocuments(): Promise<IProperty<TDocumentReference>[]> {
		console.log("get docs");
		const documents = PS.documents.map(d=> new DocumentExtra(d));
		const docs = documents.map(async d => ({ value: d._id.toString(), label: await d.$title() }));
		const result = await Promise.all(docs);
		return result;
	}

	private static getDocumentExtra(arg:IContentWrapper<TDocumentReference>):DocumentExtra|null {
		let docID: number;
		if (arg.value === "active") {
			docID = PS?.activeDocument?._id;
		} else {
			docID = parseInt(arg.value);
		}
		if (!docID) { return null;}
		const docE = new DocumentExtra(new PS.Document(docID));
		return docE;
	}

	public static getLayers(arg: IContentWrapper<TDocumentReference>): IProperty<TLayerReference>[] { 
		const docE = this.getDocumentExtra(arg);
		if (!docE) { return [];}
		const layers = docE.layers.map(d => ({ value: d._id.toString(), label: d.name }));
		return layers;
	}

	public static getChannels(arg: IContentWrapper<TDocumentReference>): IProperty<TChannelReference>[] {
		const docE = this.getDocumentExtra(arg);
		if (!docE) { return [];}	
		const pairs: IProperty<TChannelReference>[] = docE.userChannelIDsAndNames.map(p=>({value:p.value.toString(),label:p.label})); // remove index
		return pairs;
	}

	public static getPaths(arg: IContentWrapper<TDocumentReference>): IProperty<TPathReference>[] {
		const docE = this.getDocumentExtra(arg);
		if (!docE) { return [];}	
		const pairs: IProperty<TPathReference>[] = docE.userPathsIDsAndNames.map(p=>({value:p.value.toString(),label:p.label}));
		return pairs;
	}

	public static getGuides(arg: IContentWrapper<TDocumentReference>): IProperty<TGuideReference>[] { 
		const docE = this.getDocumentExtra(arg);
		if (!docE) { return [];}	
		const pairs: IProperty<TPathReference>[] = docE.guidesIDs.map(p=>({value:p.value.toString(),label:p.label}));
		return pairs;
	}
	public static getHistory(): IProperty<THistoryReference>[] { 
		const pairs = GetInfo.getHistory();
		const result: IProperty<THistoryReference>[]  = pairs.filter(p=>p.snapshot===false).map(p=>({value:p.value.toString(),label:p.label})); // remove snapshot
		return result;
	}

	public static getSnapshots(): IProperty<THistoryReference>[] { 
		const pairs = GetInfo.getHistory();
		const result: IProperty<THistoryReference>[]  = pairs.filter(p=>p.snapshot===true).map(p=>({value:p.value.toString(),label:p.label})); // remove snapshot
		return result;
	}

	public static getActionSets():IProperty<TActionSet>[] {
		const actionSets:IProperty<TActionSet>[] = PS.actionTree.map(item => ({ value: item._id.toString(), label: item.name }));
		return actionSets;
	}

	public static getActionItem(actionSetID: number): IProperty<TActionItem>[] {
		const actionSet = new PS.ActionSet(actionSetID);
		const action:IProperty<TActionItem>[] = actionSet.actions.map(item => ({ value: item._id.toString(), label: item.name }));
		return action;
	}

	public static getActionCommand(actionItemID: number): IProperty<TActionCommand>[] {
		const result2 = GetInfo.getAllCommandsOfAction(actionItemID);

		const final:IProperty<TActionCommand>[] = result2.map(item => ({ value: item.ID.toString(), label: item.name }));
		return final;
	}
}