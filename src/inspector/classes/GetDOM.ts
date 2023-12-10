import {app} from "photoshop";
import {Action, ActionSet} from "photoshop/dom/Actions";
import {Layer} from "photoshop/dom/Layer";
import {Photoshop} from "photoshop/dom/Photoshop";
import {Document} from "photoshop/dom/Document";
import {Guide} from "photoshop/dom/Guide";
import {Reference, TReference} from "./Reference";

export class ReferenceToDOM extends Reference {

	constructor(ref: TReference[]) {
		super(ref);
	}

	public getDom(): Photoshop | Layer | Document | ActionSet | Action | Guide | null {

		if (!this.targetClass) {
			return null;
		}

		switch (this.targetClass) {
			case "historyState":
				return this.getHistoryDom();
			case "snapshotClass":
				return this.getHistoryDom();
			case "application":
				return this.getAppDom();
			case "layer":
				return this.getLayerDom();
			case "document":
				return this.getDocumentDom();
			case "actionSet":
				return this.actionSetDom();
			case "action":
				return this.actionItemDom();
			case "guide":
				return this.getGuideDom();
			case "channel":
				return this.getChannelDom();
			case "path":
				return this.getPathDom();
		}
		return null;
	}

	private getGuideDom(): Guide | null {
		this.sanitizeDocRef();
		if (!this.document || !this.guide || !this.exists) {
			return null;
		}
		const guideDom = new app.Guide(this.guide._id, this.document._id);
		return guideDom;
	}


	private getAppDom(): Photoshop {
		return app;
	}

	private getDocumentDom(): Document | null {
		if (!this.document || !this.exists) {
			return null;
		}
		const docDom = new app.Document(this.document._id);
		return docDom;
	}

	private getLayerDom(): Layer | null {
		this.sanitizeDocRef();
		if (!this.document || !this.layer || !this.exists) {
			return null;
		}
		const layerDom = new app.Layer(this.layer._id, this.document._id);
		return layerDom;
	}

	private getHistoryDom() {
		const doc = app.activeDocument;
		// In DOM both are the same but Alchemist makes a difference
		const historyItem = this.historyState || this.snapshotClass;
		if (!doc || !historyItem || !this.exists) {
			return null;
		}
		// TODO improve once constructor will be exposed in Photoshop class
		const history = new (doc.activeHistoryState as any).constructor(historyItem._id, doc.id);
		return history;
	}

	private getChannelDom() {
		this.sanitizeDocRef();
		const doc = this.getDocumentDom();
		if (!doc || !this.channel || !this.exists) {
			return null;
		}
		// TODO improve once constructor will be exposed in Photoshop class
		if ("_enum" in this.channel) {
			const compositeChannel = new (doc.compositeChannels[0] as any).constructor(doc.id, this.channel._value);
			return compositeChannel;
		} else {
			console.error("Not implemented");
			// throw new Error("Not implemented");
		}
	}

	private getPathDom() {
		console.error("Not implemented");
		return null;
	}

	private actionSetDom(): ActionSet | null {
		if (!this.actionSet || !this.exists) {
			return null;
		}
		const docDom = new app.ActionSet(this.actionSet._id);
		return docDom;
	}

	private actionItemDom(): Action | null {
		if (!this.action || !this.exists) {
			return null;
		}
		const docDom = new app.Action(this.action._id);
		return docDom;
	}

	/** Uses existing Document reference otherwise adds active document reference */
	private sanitizeDocRef() {
		const id = this?.document?._id || app.activeDocument?.id || undefined;
		if (typeof id !== "number") {
			return;
		}
		this.setDocument(id);
	}
}