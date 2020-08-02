import React from "react";
import { IconPin } from "../../../shared/components/icons";
import { TShouldExpandNode } from "../JSONTree/types";
import { TPath } from "../../model/types";


export const labelRenderer = ([key, ...rest]: TPath, onInspectPath: (path: TPath, mode: "replace" | "add") => void, nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
	
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
					() => onInspectPath([...[key, ...rest].reverse()], "add")
				}
			>
				<IconPin />
			</span>}
			{!expanded && ": "}
		</span>
	);
};

export const renderPath = (path: TPath, onInspectPath: (path: TPath, mode: "replace" | "add") => void): React.ReactNode[] => {
	const parts: React.ReactNode[] = [
		<span className="pathItem" key="root" onClick={() => { onInspectPath([], "replace"); }}>
			<span className="link">root</span>
		</span>
	];
	for (let i = 0, len = path.length; i < len; i++) {
		parts.push(
			<span className="pathItem" key={i} onClick={() => { onInspectPath(path.slice(0, i + 1), "replace"); }}>
				<span className="link">{path[i]}</span>
			</span>
		);
	}
	return parts;
};

export const shouldExpandNode = (expandedKeys: TPath[]): TShouldExpandNode => {
	return (keyPath, data, level) => {
		const keyPathString = [...keyPath].reverse().join("-");
		for (const path of expandedKeys) {
			if (path.length === level) { // cheap check				
				if (path.join("-") === keyPathString) { // more expensive check
					return true;
				}
			}
		}
		return false;
	};
};