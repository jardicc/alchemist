import { IDescriptor } from "../model/types";
import photoshop from "photoshop";

export function filterNonExistent(descriptors: IDescriptor[]):IDescriptor[] {
	const validate = photoshop.action.validateReference;

	const result = descriptors.filter(desc => {
		let res = false;
		switch (desc.originalReference.type) {
			case "featureData":
			case "customDescriptor":
			case "listener": {
				return true;
			}
			default: {
				res = validate(desc.calculatedReference._target);
				return res;
			}
		}
	});

	return result;
}