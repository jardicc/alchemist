import { IDescriptor } from "../model/types";
import photoshop from "photoshop";
import { validateReference } from "../../shared/helpers";
import { ActionDescriptor } from "photoshop/dom/CoreModules";

export function filterNonExistent(descriptors: IDescriptor[]):IDescriptor[] {
	

	const result = descriptors.filter(desc => {
		let res = false;
		switch (desc.originalReference.type) {
			case "featureData":
			case "customDescriptor":
			case "listener": {
				return true;
			}
			default: {
				res = validateReference((desc.calculatedReference as ActionDescriptor)._target);
				return res;
			}
		}
	});

	return result;
}