
import { IDReference } from "./GetInfo";
import { Layer } from "photoshop/dom/Layer";
import { app } from "photoshop";
import { validateReference } from "../../shared/helpers";

export class LayerExtra extends app.Layer{
	constructor(layer: Layer) {
		super(layer.id, layer._docId);
	}

	public get amReference():IDReference[] {
		return ([
			{
				"_ref": "layer",
				"_id": this.id,
			},
			{
				"_ref": "document",
				"_id": this._docId,
			},
		]);
	}

	public get exists(): boolean{
		return validateReference(this.amReference);
	}
}