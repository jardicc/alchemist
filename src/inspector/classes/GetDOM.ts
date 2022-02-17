import photoshop from "photoshop";
import { TReference, IDReference } from "./GetInfo";
import { DocumentExtra } from "./DocumentExtra";
import { LayerExtra } from "./LayerExtra";
import { Action, ActionSet } from "photoshop/dom/Actions";
import { Layer } from "photoshop/dom/Layer";
import { Photoshop } from "photoshop/dom/Photoshop";
import { Document } from "photoshop/dom/Document";

export class GetDOM{
	public static getDom(ref: TReference[]): Photoshop | Layer | Document | ActionSet | Action | null {
		const res: IDReference[] = ref?.filter(v => ("_ref" in v)) as IDReference[];
		if (!res) {
			return null;
		}

		if (res[0]._ref === "historyState" || res[0]._ref === "snapshot") {
			return GetDOM.getHistoryDom(res[0]._id, res[1]?._id);
		}

		if (res[0]._ref === "application") {
			return GetDOM.getAppDom();
		}

		if (res[0]._ref === "layer") {
			if (res.length === 1) {
				return GetDOM.getLayerDom(res[0]._id,null);				
			} else {
				return GetDOM.getLayerDom(res[0]._id,res[1]._id);				
			}
		}

		if (res[0]._ref === "document") {
			return GetDOM.getDocumentDom(res[0]._id);
		}

		if (res[0]._ref === "actionSet") {
			return GetDOM.actionSetDom(res[0]._id);
		}
		if (res[0]._ref === "action") {
			return GetDOM.actionItemDom(res[0]._id);
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