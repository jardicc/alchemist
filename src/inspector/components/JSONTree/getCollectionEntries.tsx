/* eslint-disable @typescript-eslint/no-explicit-any */
import {TProtoMode} from "../../model/types";
import {TNodeType, TSortObjectKeys} from "./types";
import {addMoreKeys} from "../../../shared/helpers";

function getLength(type: TNodeType, collection: any) {
	if (type === "Object") {
		return Object.keys(collection).length;
	} else if (type === "Array") {
		return collection.length;
	}

	return Infinity;
}

function isIterableMap(collection: any) {
	return typeof collection.set === "function";
}



function getEntries(protoMode: TProtoMode = "none", type: TNodeType, collection: any, sortObjectKeys: TSortObjectKeys, from = 0, to = Infinity) {
	let res;
	if (type === "Object") {
		let keys: string[] = Object.getOwnPropertyNames(collection);

		// experimental
		if (collection.__proto__) {
			keys = [...keys, ...addMoreKeys(protoMode, collection)];
		}
		// experimental end

		if (sortObjectKeys) {
			keys.sort(sortObjectKeys === true ? undefined : sortObjectKeys);
		}

		keys = keys.slice(from, to + 1);

		res = {
			entries: keys.map(key => {
				let value;
				try {
					value = collection[key];
				} catch (e: any) {
					value = "!!! ERROR !!! " + e?.message || "";
				}
				return {key, value};
			}),
		};
	} else if (type === "Array") {
		res = {
			entries: collection
				.slice(from, to + 1)
				.map((val: any, idx: number) => ({key: idx + from, value: val})),
		};
	} else {
		let idx = 0;
		const entries = [];
		let done = true;

		const isMap = isIterableMap(collection);

		for (const item of collection) {
			if (idx > to) {
				done = false;
				break;
			}
			if (from <= idx) {
				if (isMap && Array.isArray(item)) {
					if (typeof item[0] === "string" || typeof item[0] === "number") {
						entries.push({key: item[0], value: item[1]});
					} else {
						entries.push({
							key: `[entry ${idx}]`,
							value: {
								"[key]": item[0],
								"[value]": item[1],
							},
						});
					}
				} else {
					entries.push({key: idx, value: item});
				}
			}
			idx++;
		}

		res = {
			hasMore: !done,
			entries,
		};
	}

	return res;
}

function getRanges(from: number, to: number, limit: number) {
	const ranges = [];
	while (to - from > limit * limit) {
		limit = limit * limit;
	}
	for (let i = from; i <= to; i += limit) {
		ranges.push({from: i, to: Math.min(to, i + limit - 1)});
	}

	return ranges;
}

export function getCollectionEntries(
	protoMode: TProtoMode,
	type: TNodeType,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	collection: any,
	sortObjectKeys: TSortObjectKeys,
	limit: number,
	from = 0,
	to = Infinity,
): JSX.Element[] {
	const getEntriesBound = (from?: number, to?: number) => {
		return getEntries(protoMode, type, collection, sortObjectKeys, from, to);
	};

	if (!limit) {
		return getEntriesBound().entries;
	}

	const isSubset = to < Infinity;
	const length = Math.min(to - from, getLength(type, collection));

	if (type !== "Iterable") {
		if (length <= limit || limit < 7) {
			return getEntriesBound(from, to).entries;
		}
	} else {
		if (length <= limit && !isSubset) {
			return getEntriesBound(from, to).entries;
		}
	}

	let limitedEntries;
	if (type === "Iterable") {
		const {hasMore, entries} = getEntriesBound(from, from + limit - 1);

		limitedEntries = hasMore
			? [...entries, ...getRanges(from + limit, from + 2 * limit - 1, limit)]
			: entries;
	} else {
		limitedEntries = isSubset
			? getRanges(from, to, limit)
			: [
				...getEntriesBound(0, limit - 5).entries,
				...getRanges(limit - 4, length - 5, limit),
				...getEntriesBound(length - 4, length - 1).entries,
			];
	}

	return limitedEntries;
}
