import photoshop from "photoshop";
import { TReference, IDReference } from "./GetInfo";
import { DocumentExtra } from "./DocumentExtra";
import { LayerExtra } from "./LayerExtra";
import { Action, ActionSet } from "photoshop/dom/Actions";
import { Layer } from "photoshop/dom/Layer";
import { Photoshop } from "photoshop/dom/Photoshop";
import { Document } from "photoshop/dom/Document";
import {Guide} from "photoshop/dom/Guide";

export class GetDOM{
	public static getDom(ref: TReference[]): Photoshop | Layer | Document | ActionSet | Action | Guide | null {
		const res: IDReference[] = ref?.filter(v => ("_ref" in v)) as IDReference[];
		if (!res) {
			return null;
		}

		switch (res[0]._ref) {
			case "historyState":
			case "snapshot":
				return GetDOM.getHistoryDom(res[0]._id, res[1]?._id);
			case "application":
				return GetDOM.getAppDom();
			case "layer": {
				if (res.length === 1) {
					return GetDOM.getLayerDom(res[0]._id, null);
				}
				return GetDOM.getLayerDom(res[0]._id, res[1]._id);
			}
			case "document": 
				return GetDOM.getDocumentDom(res[0]._id);
			case "actionSet": 
				return GetDOM.actionSetDom(res[0]._id);
			case "action": 
				return GetDOM.actionItemDom(res[0]._id);
			case "guide":{
				const guides = GetDOM.getDocumentDom(res[1]._id)?.guides;
				const found:Guide|null = (guides as any)?.find((g: Guide) => g.id === res[0]._id);
				if (!found) {return null;}
				return found;
			}
		}
		return null;
	}

	private static sanitizeDocId(docId: number|null) {
		if (typeof docId !== "number") {
			if (!photoshop.app.activeDocument) {
				return null;
			}
			docId = photoshop.app.activeDocument.id;
		}
		return docId;
	}

	/*
	private static getGuideDom(): Guide{
		const guide = new photoshop.app.
	}
	*/
	
	private static getAppDom():Photoshop {
		const appDom = new photoshop.app.Photoshop();
		return appDom;
	}

	private static getDocumentDom(doc: number):Document|null {
		const docDom = new photoshop.app.Document(doc);
		if (!docDom) { return null;}
		const extraDom = new DocumentExtra(docDom);
		if (!extraDom.exists) {
			return null;
		}
		return docDom;
	}

	private static getLayerDom(layer: number, docId: number|null): Layer|null {
		docId = GetDOM.sanitizeDocId(docId);
		if (!docId) { return null;}
		const layerDom = new photoshop.app.Layer(layer, docId);
		const layerExtra = new LayerExtra(layerDom);
		if (!layerExtra.exists) {
			return null;
		}
		return layerDom;
	}

	private static getHistoryDom(historyId: number, docId: number|null) {
		docId = GetDOM.sanitizeDocId(docId);
		if (!docId) { return null;}
		const doc = GetDOM.getDocumentDom(docId);
		const found = (doc as any).historyStates.find((h: any) => historyId === h.id) || null;
		return found;
	}

	private static actionSetDom(actionSetID: number):ActionSet {
		const docDom = new photoshop.app.ActionSet(actionSetID);
		return docDom;
	}
	private static actionItemDom(actionItemID: number):Action {
		const docDom = new photoshop.app.Action(actionItemID);
		return docDom;
	}
}