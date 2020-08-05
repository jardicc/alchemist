import photoshop from "photoshop";
import {TDocumentReference, IContentWrapper, TLayerReference, TChannelReference, TPathReference, TActionSet, TActionItem, TActionCommand } from "../model/types";
import { IProperty } from "../components/LeftColumn/LeftColumn";
import Document from "photoshop/dist/dom/Document";
import { DocumentExtra } from "./DocumentExtra";
import { Descriptor } from "photoshop/dist/types/UXP";
import { ActionDescriptor } from "photoshop/dist/types/photoshop";
import { GetInfo } from "./GetInfo";
import { action } from "../../shared/imports";

const PS = photoshop.app;

export class GetList{
	public static getDocuments():IProperty<TDocumentReference>[] {
		const docs: IProperty<TDocumentReference>[] = PS.documents.map(d => ({ value: d._id.toString(), label: d.title }));
		return docs;
	}

	public static getLayers(arg: IContentWrapper<TDocumentReference>): IProperty<TLayerReference>[] { 
		let doc: Document;
		if (arg.value === "active") {
			doc = PS.activeDocument;
		} else {
			doc = new PS.Document(parseInt(arg.value));
		}
		const layers = doc.layers.map(d => ({ value: d._id.toString(), label: d.name }));
		return layers;
	}

	public static getChannels(arg: IContentWrapper<TDocumentReference>): IProperty<TChannelReference>[] {
		let docID: number;
		console.log("Get channels");
		if (arg.value === "active") {
			docID = PS.activeDocument._id;
		} else {
			docID = parseInt(arg.value);
		}

		const docE = new DocumentExtra(new PS.Document(docID));
		
		const pairs: IProperty<TChannelReference>[] = docE.userChannelIDsAndNames.map(p=>({value:p.value.toString(),label:p.label})); // remove index

		return pairs;
	}

	public static getPaths(arg: IContentWrapper<TDocumentReference>): IProperty<TPathReference>[] {
		let docID: number;
		console.log("Get paths");
		if (arg.value === "active") {
			docID = PS.activeDocument._id;
		} else {
			docID = parseInt(arg.value);
		}

		const docE = new DocumentExtra(new PS.Document(docID));
		
		const pairs: IProperty<TPathReference>[] = docE.userPathsIDsAndNames.map(p=>({value:p.value.toString(),label:p.label})); // remove index

		return pairs;
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