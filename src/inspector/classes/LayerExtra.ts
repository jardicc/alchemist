import photoshop, { action, Layer } from "photoshop";
import { IDReference } from "./GetInfo";

export class LayerExtra extends photoshop.app.Layer {
	constructor(layer: Layer) {
		super(layer._id, layer._docId);
	}

	public get amReference():IDReference[] {
		return ([
			{
				"_ref": "layer",
				"_id": this._id,
			},
			{
				"_ref": "document",
				"_id": this._docId,
			},
		]);
	}

	public get exists(): boolean{
		return action.validateReference(this.amReference);
	}
}
