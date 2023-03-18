import photoshop, {app} from "photoshop";
import { Action, ActionSet } from "photoshop/dom/Actions";
import { Layer } from "photoshop/dom/Layer";
import { Photoshop } from "photoshop/dom/Photoshop";
import { Document } from "photoshop/dom/Document";
import {Guide} from "photoshop/dom/Guide";
import {Reference, TReference} from "./Reference";
import {isValidRef} from "../../shared/helpers";

export class GetDOM{
	public static getDom(ref: TReference[]): Photoshop | Layer | Document | ActionSet | Action | Guide | null {
		
		const r = new Reference(ref);
		
		if (!r.targetClass) {
			return null;
		}

		switch (r.targetClass) {
			case "historyState":
				return r.snapshotClass ? GetDOM.getHistoryDom(r) : null;
			case "snapshotClass":
				return r.historyState ? GetDOM.getHistoryDom(r) : null;
			case "application":
				return GetDOM.getAppDom();
			case "layer": 
				return r.layer ? GetDOM.getLayerDom(r) : null;
			case "document": 
				return GetDOM.getDocumentDom(r);
			case "actionSet": 
				return GetDOM.actionSetDom(r);
			case "action": 
				return GetDOM.actionItemDom(r);
			case "guide":{
				const guides = GetDOM.getDocumentDom(r)?.guides;
				if (!guides || !r.guide) {return null;}
				const found: Guide | null = (guides as any)?.find((g: Guide) => g.id === r.guide?._id);
				if (!found) {return null;}
				return found;
			}
		}
		return null;
	}

	private static sanitizeDocId(ref?: Reference) {
		return ref?.document?._id || photoshop.app.activeDocument.id || undefined;
	}

	/*
	private static getGuideDom(): Guide{
		const guide = new photoshop.app.
	}
	*/
	
	private static getAppDom():Photoshop {
		return app;
	}

	private static getDocumentDom(ref: Reference): Document | null {
		if (!ref.document) {
			return null;
		}
		const docDom = new app.Document(ref.document._id);
		if (!isValidRef(ref.document)) {
			return null;
		}		
		return docDom;
	}

	private static getLayerDom(ref:Reference): Layer|null {
		const docId = GetDOM.sanitizeDocId(ref);
		if (!docId || !ref.layer) { return null;}
		const layerDom = new app.Layer(ref.layer._id, docId);
		if (!isValidRef(ref.layer)) {
			return null;
		}
		return layerDom;
	}

	private static getHistoryDom(ref:Reference) {
		const docId = GetDOM.sanitizeDocId(ref);
		if (!docId) { return null;}
		const doc = GetDOM.getDocumentDom(ref);
		if (doc && ref.historyState) {
			const found = doc.historyStates.find((h) => ref.historyState?._id === h.id) || null;
			return found;
		}
		return null;
	}

	private static actionSetDom(ref: Reference): ActionSet|null {
		if (ref.actionSet) {
			const docDom = new photoshop.app.ActionSet(ref.actionSet._id);
			return docDom;
		}
		return null;
	}
	private static actionItemDom(ref: Reference): Action|null {
		if (ref.action) {
			const docDom = new photoshop.app.Action(ref.action._id);
			return docDom;
		}
		return null;
	}
}