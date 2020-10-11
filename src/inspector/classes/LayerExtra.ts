import Layer from "photoshop/dist/dom/Layer";
import { IDReference } from "./GetInfo";
import { action } from "../../shared/imports";

type TLayer = typeof Layer;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const LayerNative:TLayer  = require("photoshop").app.Layer;

export class LayerExtra extends LayerNative{
	constructor(layer: Layer) {
		super(layer._id, layer._docId);
	}

	public get amReference():IDReference[] {
		return ([
			{
				"_ref": "layer",
				"_id": this._id
			},
			{
				"_ref": "document",
				"_id": this._docId
			}
		]);
	}

	public get exists(): boolean{
		return action.validateReference(this.amReference);
	}
}