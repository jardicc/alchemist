
import { Layer } from "photoshop/dom/Layer";
import { app } from "photoshop";
import { isValidRef } from "../../shared/helpers";
import {IDReference} from "./Reference";

export class LayerExtra extends app.Layer{
	constructor(layer: Layer) {
		super(layer.id, layer._docId);
	}

	public get amReference(): [IDReference<"layer">, IDReference<"document">] {
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
		return isValidRef(this.amReference);
	}
}