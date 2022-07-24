import { ITargetReference, TTargetReference, TAllReferenceSubtypes } from "../model/types";
import { IPropertyReference, TReference } from "./GetInfo";
import { Reference } from "./Reference";
import { getInitialState } from "../inspInitialState";

export const guessOrinalReference = (refAM: TReference[]): ITargetReference => {
	const r = new Reference(refAM);
	const type = getType(r);

	const result: ITargetReference = {
		type,
		data: generateData(type,r),
	};

	return result;
};

function getType(r: Reference): TTargetReference {
	if (r.hasApplication) { return "application"; }
	if (r.hasChannel) { return "channel"; }
	if (r.hasPath) { return "path"; }
	if (r.actionSet) { return "action"; }
	if (r.hasLayer) { return "layer"; }
	if (r.hasGuide) { return "guide"; }
	if (r.hasHistoryState) { return "history";}
	if (r.hasSnapshotClass) { return "snapshot"; }
	if (r.hasDocument) { return "document"; }
	throw new Error("Unkown type: " + JSON.stringify(r.amCode, null, 3));
}

function generateData(type: TTargetReference,r:Reference):TAllReferenceSubtypes[] {
	
	const found = getInitialState().targetReference.find(item => item.type === type);
	if (!found) {
		throw new Error("Unkown type: " + type);
	}

	if (r.hasProperty) {
		const foundProperty = found.data.find(item => item.subType === "property");
		if (foundProperty) {
			foundProperty.content.value = (r.property as IPropertyReference)._property;
		}
	}


	return found.data || [];
}