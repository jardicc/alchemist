import React from "react";
import {IconPinDown} from "../../shared/components/icons";
import {KeyPath, TShouldExpandNode} from "./react-json-tree-2/types";

export const labelRenderer = ([key, ...rest]: KeyPath, onInspectPath: (path: KeyPath, mode: "replace" | "add") => void, nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {

	let noPin = false;
	if (typeof key === "string") {
		noPin = key.startsWith("$$$noPin_");
		key = key.replace("$$$noPin_", "");
	}
	return (
		<span>
			<span className={"treeItemKey" + (expandable ? " expandable" : "")}>
				{key}
			</span>
			{(noPin) ? null : <span
				className="treeItemPin"
				onClick={
					() => { onInspectPath([...[key, ...rest].reverse()], "add"); }
				}
			>
				<IconPinDown />
			</span>}
			{!expanded && ": "}
		</span>
	);
};

export const renderPath = (path: KeyPath, onInspectPath: (path: KeyPath, mode: "replace" | "add") => void): React.ReactNode[] => {
	const parts: React.ReactNode[] = [
		<span className="pathItem" key="root" onClick={() => {onInspectPath([], "replace");}}>
			<span className="link">root</span>
		</span>,
	];
	for (let i = 0, len = path.length; i < len; i++) {
		parts.push(
			<span className="pathItem" key={i} onClick={() => {onInspectPath(path.slice(0, i + 1), "replace");}}>
				<span className="link">{path[i]}</span>
			</span>,
		);
	}
	return parts;
};

export const shouldExpandNode = (expandedKeys: KeyPath[], autoExpandLevels = 0, allowInfinity = false): TShouldExpandNode => {
	// Pre-compute a lookup set so per-node check is O(1) instead of O(N * pathLen).
	// Also group by level so we skip the lookup entirely when no expanded path has that depth.
	const lookup = new Set<string>();
	const levelsWithEntries = new Set<number>();
	for (const path of expandedKeys) {
		lookup.add(path.join("-"));
		levelsWithEntries.add(path.length);
	}

	return (keyPath, data, level) => {
		if (levelsWithEntries.has(level ?? -1)) {
			// keyPath is stored reversed in expandedKeys; build the same key.
			let key = "";
			for (let i = keyPath.length - 1; i >= 0; i--) {
				key += i === keyPath.length - 1 ? String(keyPath[i]) : "-" + String(keyPath[i]);
			}
			if (lookup.has(key)) return true;
		}

		if (level === undefined) {
			return false;
		}

		// 0 = off
		if (autoExpandLevels !== 0) {
			// 10 = all
			if (autoExpandLevels === 10 && allowInfinity) {
				return true;
			}
			return level <= autoExpandLevels;
		}
		return false;
	};
};
