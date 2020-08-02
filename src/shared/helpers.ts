import { TProtoMode } from "../inspector/model/types";

export function addMoreKeys(protoMode: TProtoMode, collection: any): string[] {
	if (protoMode === "none") {
		return [];
	}
	let keys = Object.getOwnPropertyNames(collection.__proto__);
	if (protoMode === "advanced") {
		keys = keys.filter(k => !(k.startsWith("__") && k.endsWith("__")));
	} else if (protoMode === "uxp") {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const obj:any = new Object();
		const defaultKeys = Object.getOwnPropertyNames(obj.__proto__);
		keys = keys.filter(k => !defaultKeys.includes(k));	
	}

	return keys;
}