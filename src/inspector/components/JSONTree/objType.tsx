/* eslint-disable @typescript-eslint/no-explicit-any */

import { TNodeType } from "./types";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function objType(obj: any): TNodeType {
	
	if (obj!==null && typeof obj === "object" && typeof obj[Symbol.iterator] === "function") {
		return "Iterable";
	}
	if (obj!==null && typeof obj === "object" && obj.constructor !== Object && obj instanceof Object) {
		// For projects implementing objects overriding `.prototype[Symbol.toStringTag]`
		return "Object";
	}

	const type = Object.prototype.toString.call(obj).slice(8, -1) as TNodeType;
	return type;
}
