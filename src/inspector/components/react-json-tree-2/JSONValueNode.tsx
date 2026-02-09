import React from "react";
import type {
	GetItemString,
	Key,
	KeyPath,
	TLabelRenderer,
	Styling,
	ValueRenderer,
	TNodeType,
} from "./types";
//import {treeItemsRegister} from "./index";

/**
 * Renders simple values (eg. strings, numbers, booleans, etc)
 */

interface Props {
	getItemString: GetItemString;
	key: Key;
	keyPath: KeyPath;
	labelRenderer: TLabelRenderer;
	nodeType: TNodeType;
	styling: Styling;
	value: unknown;
	level: number;
	valueRenderer: ValueRenderer;
	valueGetter?: (value: any) => unknown;
}

export default function JSONValueNode({
	nodeType,
	styling,
	labelRenderer,
	keyPath,
	valueRenderer,
	value,
	level,
	valueGetter = (value) => value,
}: Props) {
	const itemNode = (
		<li  className="treeRow" {...styling("value", nodeType, keyPath, level)}>
			<label {...styling(["label", "valueLabel"], nodeType, keyPath)}>
				{labelRenderer(keyPath, nodeType, false, false, level)}
			</label>
			<span {...styling("valueText", nodeType, keyPath)}>
				{valueRenderer(valueGetter(value), value, nodeType, ...keyPath)}
			</span>
		</li>
	);

	//treeItemsRegister.push(itemNode);

	return itemNode;
}
