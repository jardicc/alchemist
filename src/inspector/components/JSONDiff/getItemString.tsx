import React from "react";
import {Iterable} from "immutable";

const IS_IMMUTABLE_KEY = "@@__IS_IMMUTABLE__@@";

function isImmutable(value:any) {
	return Iterable.isKeyed(value) || Iterable.isIndexed(value) || Iterable.isIterable(value);
}

function isIterable(obj:any) {
	return obj !== null && typeof obj === "object" && !Array.isArray(obj) &&
		typeof obj[window.Symbol.iterator] === "function";
}

function getShortTypeString(val:any, diff:boolean) {
	if (diff && Array.isArray(val)) {
		val = val[val.length === 2 ? 1 : 0];
	}

	if (isIterable(val) && !isImmutable(val)) {
		return "(…)";
	} else if (Array.isArray(val)) {
		return val.length > 0 ? "[…]" : "[]";
	} else if (val === null) {
		return "null";
	} else if (val === undefined) {
		return "undef";
	} else if (typeof val === "object") {
		return Object.keys(val).length > 0 ? "{…}" : "{}";
	} else if (typeof val === "function") {
		return "fn";
	} else if (typeof val === "string") {
		return `"${val.substr(0, 10) + (val.length > 10 ? "…" : "")}"`;
	} else if (typeof val === "symbol") {
		return "symbol";
	} else {
		return val;
	}
}

function getText(type:any, data:any, isWideLayout:boolean, isDiff:boolean) {
	if (type === "Object") {
		const keys = Object.keys(data);
		if (!isWideLayout) return keys.length ? "{…}" : "{}";

		const str = keys
			.slice(0, 3)
			.map(key => `${key}: ${getShortTypeString(data[key], isDiff)}`)
			.concat(keys.length > 3 ? ["…"] : [])
			.join(", ");

		return `{ ${str} }`;
	} else if (type === "Array") {
		if (!isWideLayout) return data.length ? "[…]" : "[]";

		const str = data
			.slice(0, 4)
			.map((val:any) => getShortTypeString(val, isDiff))
			.concat(data.length > 4 ? ["…"] : []).join(", ");

		return `[${str}]`;
	} else {
		return type;
	}
}

export const getItemString = (type:any, data:any, isWideLayout:boolean, isDiff:boolean) =>
	<span className="treeItemHint">
		{data[IS_IMMUTABLE_KEY] ? "Immutable" : ""}
		{getText(type, data, isWideLayout, isDiff)}
	</span>;