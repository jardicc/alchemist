import photoshop from "photoshop";
import type Document from "photoshop/dist/dom/Document";
import Layer from "photoshop/dist/dom/Layer";
import { Photoshop } from "photoshop/dist/dom/Photoshop";
import { ActionSet, Action } from "photoshop/dist/dom/Actions";
import { TReference, IDReference } from "./GetInfo";
import { DocumentExtra } from "./DocumentExtra";
import { LayerExtra } from "./LayerExtra";

export class GetDOM{
	public static getDom(ref: TReference[]): Photoshop | Layer | Document | ActionSet | Action | null {
		const res: IDReference[] = ref?.filter(v => ("_ref" in v)) as IDReference[];
		if (!res) {
			return null;
		}

		if (res[0]._ref === "application") {
			return GetDOM.getAppDom();
		}

		if (res[0]._ref === "layer") {
			if (res.length === 1) {
				return GetDOM.getLayerDom(res[0]._id);				
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

	private static getAppDom():Photoshop {
		const appDom = new photoshop.app.Photoshop();
		return appDom;
	}

	private static getLayerDom(layer: number, doc?: number): Layer|null {
		if (doc === undefined) {
			doc = photoshop.app.activeDocument._id;
		}
		const layerDom = new photoshop.app.Layer(layer, doc);
		const layerExtra = new LayerExtra(layerDom);
		if (!layerExtra.exists) {
			return null;
		}
		return layerDom;
	}

	private static getDocumentDom(doc: number):Document|null {
		const docDom = new photoshop.app.Document(doc);
		const extraDom = new DocumentExtra(docDom);
		if (!extraDom.exists) {
			return null;
		}
		return docDom;
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