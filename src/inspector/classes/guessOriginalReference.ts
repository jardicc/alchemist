import { IRefLayer, TAllTargetReferences } from "../model/types";
import { Reference, TReference } from "./Reference";
import { getInitialState } from "../inspInitialState";

// used for auto inspector
export const guessOriginalReference = (refAM: TReference[]): TAllTargetReferences|null => {
	const r = new Reference(refAM);
	const init = getInitialState().targetReference;

	// TODO
	// !!!
	if (r.layer) {
		const res: IRefLayer = {
			...init.layer,
			documentID: r.document?._id ?? init.layer.documentID,
			layerID: r.layer?._id ?? init.layer.layerID,
		};
		return res;
	}

	return null;
};