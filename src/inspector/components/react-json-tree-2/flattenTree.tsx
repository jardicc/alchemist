import React from "react";
import {objType} from "./objType";
import getCollectionEntries from "./getCollectionEntries";
import JSONArrow from "./JSONArrow";
import type {
	KeyPath, GetItemString, TLabelRenderer, ValueRenderer,
	ShouldExpandNodeInitially, PostprocessValue, IsCustomNode,
	SortObjectKeys, Styling, TNodeType, TStylingArgs, TExpandClicked,
	TProtoMode, CircularCache, TShouldExpandNode,
} from "./types";

export interface FlattenTreeOptions {
	styling: Styling;
	labelRenderer: TLabelRenderer;
	valueRenderer: ValueRenderer;
	getItemString: GetItemString;
	postprocessValue: PostprocessValue;
	isCustomNode: IsCustomNode;
	collectionLimit: number;
	sortObjectKeys: SortObjectKeys;
	protoMode: TProtoMode;
	hideRoot: boolean;
	expandedPaths: Map<string, boolean>;
	onToggle: () => void;
	expandClicked: TExpandClicked;
	shouldExpandNodeInitially: ShouldExpandNodeInitially;
	shouldExpandNode: TShouldExpandNode;
}

function getPathKey(keyPath: KeyPath): string {
	return keyPath.join("/");
}

function getNodeTypeIndicator(nodeType: TNodeType): string | null {
	switch (nodeType) {
		case "Error": return "Error()";
		case "Object": case "WeakMap": case "WeakSet": return "{}";
		case "Array": return "[]";
		case "Iterable": case "Map": case "Set": return "()";
		default: return null;
	}
}

function isNestedType(nodeType: TNodeType): boolean {
	switch (nodeType) {
		case "Object": case "Error": case "WeakMap": case "WeakSet":
		case "Array": case "Iterable": case "Map": case "Set":
			return true;
		default:
			return false;
	}
}

function isExpandable(nodeType: TNodeType, data: unknown): boolean {
	switch (nodeType) {
		case "Object": case "Error": case "WeakMap": case "WeakSet":
			return Object.getOwnPropertyNames(data).length > 0;
		case "Array":
			return (data as unknown[]).length > 0;
		case "Iterable": case "Map": case "Set":
			return true;
		default:
			return false;
	}
}

function createItemStringForType(nodeType: TNodeType, data: unknown, collectionLimit: number): string {
	switch (nodeType) {
		case "Object": case "Error": case "WeakMap": case "WeakSet": {
			const len = Object.getOwnPropertyNames(data).length;
			return `${len} ${len !== 1 ? "keys" : "key"}`;
		}
		case "Array": {
			const len = (data as unknown[]).length;
			return `${len} ${len !== 1 ? "items" : "item"}`;
		}
		case "Iterable": case "Map": case "Set": {
			let count = 0;
			let hasMore = false;
			if (Number.isSafeInteger((data as any).size)) {
				count = (data as any).size;
			} else {
				for (const _ of data as Iterable<unknown>) {
					if (collectionLimit && count + 1 > collectionLimit) {
						hasMore = true;
						break;
					}
					count += 1;
				}
			}
			return `${hasMore ? ">" : ""}${count} ${count !== 1 ? "entries" : "entry"}`;
		}
		default: return "";
	}
}

function getValueGetter(nodeType: TNodeType): (raw: any) => unknown {
	switch (nodeType) {
		case "String": return (raw: string) => `"${raw}"`;
		case "Number": return (raw: any) => raw;
		case "Boolean": return (raw: boolean) => (raw ? "true" : "false");
		case "Date": return (raw: Date) => raw.toISOString();
		case "Null": return () => "null";
		case "Undefined": return () => "undefined";
		case "Function": case "Symbol": return (raw: any) => raw.toString();
		case "Custom": return (raw: any) => raw;
		default: return () => `<${nodeType}>`;
	}
}

/**
 * Flattens collection entries (which may include ItemRanges) into a flat array of ReactElements.
 */
function flattenEntries(
	entries: any[],
	nodeType: TNodeType,
	data: unknown,
	keyPath: KeyPath,
	parentPathKey: string,
	options: FlattenTreeOptions,
	level: number,
	circularCache: CircularCache,
): React.ReactElement[] {
	const result: React.ReactElement[] = [];
	const {styling, postprocessValue, protoMode, sortObjectKeys, collectionLimit, expandedPaths, onToggle} = options;

	for (const entry of entries) {
		if ("to" in entry && "from" in entry) {
			// ItemRange
			const rangeKey = `${parentPathKey}/ItemRange--${entry.from}-${entry.to}`;
			const rangeExpanded = expandedPaths.get(rangeKey) ?? false;

			if (rangeExpanded) {
				const subEntries = getCollectionEntries(
					protoMode, nodeType, data,
					sortObjectKeys, collectionLimit, entry.from, entry.to,
				);
				result.push(...flattenEntries(
					subEntries, nodeType, data, keyPath, rangeKey,
					options, level, circularCache,
				));
			} else {
				const handleRangeClick = () => {
					expandedPaths.set(rangeKey, true);
					onToggle();
				};
				result.push(
					<li key={rangeKey} className="treeRow" {...styling("itemRange", false)} onClick={handleRangeClick}>
						<JSONArrow
							nodeType={nodeType}
							styling={styling}
							expanded={false}
							onClick={handleRangeClick}
							arrowStyle="double"
						/>
						{`${entry.from} ... ${entry.to}`}
					</li>,
				);
			}
		} else if ("key" in entry) {
			const {key, value: childValue} = entry;
			const childIsCircular = circularCache.includes(childValue);
			result.push(...flattenTree(
				postprocessValue(childValue),
				[key, ...keyPath],
				options,
				level + 1,
				[...circularCache, childValue],
				childIsCircular,
			));
		}
	}

	return result;
}

/**
 * Recursively walks a data structure and produces a flat array of `<li>` elements,
 * replicating the output of JSONNestedNode / JSONValueNode without React component nesting.
 */
export function flattenTree(
	value: unknown,
	keyPath: KeyPath,
	options: FlattenTreeOptions,
	level: number = 0,
	circularCache: CircularCache = [],
	isCircular: boolean = false,
): React.ReactElement[] {
	const {
		styling, labelRenderer, valueRenderer, getItemString,
		isCustomNode, collectionLimit, sortObjectKeys, protoMode,
		hideRoot, expandedPaths, onToggle, expandClicked,
		shouldExpandNodeInitially, shouldExpandNode,
	} = options;

	const nodeType = isCustomNode(value) ? "Custom" : objType(value);
	const result: React.ReactElement[] = [];

	if (isNestedType(nodeType)) {
		// ── Nested node (Object, Array, Iterable, etc.) ──
		const expandable = !isCircular && isExpandable(nodeType, value);
		const pathKey = getPathKey(keyPath);
		const nodeTypeIndicator = getNodeTypeIndicator(nodeType)!;

		// Determine expanded state
		let expanded: boolean;
		if (isCircular) {
			expanded = false;
		} else if (expandedPaths.has(pathKey)) {
			expanded = expandedPaths.get(pathKey)!;
		} else {
			expanded = shouldExpandNodeInitially(keyPath, value, level);
			expandedPaths.set(pathKey, expanded);
		}
		expanded = expanded || shouldExpandNode(keyPath, value, level);

		const stylingArgs: TStylingArgs = [keyPath, nodeType, expanded, expandable, level];

		const itemType = (
			<span {...styling("nestedNodeItemType", expanded)}>
				{nodeTypeIndicator}
			</span>
		);
		const renderedItemString = getItemString(
			nodeType, value, itemType,
			createItemStringForType(nodeType, value, collectionLimit),
			keyPath,
		);

		const handleClick = () => {
			if (expandable) {
				expandedPaths.set(pathKey, !expanded);
				onToggle();
			}
		};

		const handleClickWrapped = (e: React.MouseEvent<HTMLDivElement>) => {
			if (expandable) {
				const path = [...keyPath].reverse();
				expandClicked(path, !expanded, e.altKey);
			}
			handleClick();
		};

		// Render header row (unless it's a hidden root)
		if (!(hideRoot && level === 0)) {
			result.push(
				<li key={pathKey} className="treeRow" {...styling("nestedNode", ...stylingArgs)}>
					{expandable && (
						<JSONArrow
							styling={styling}
							nodeType={nodeType}
							expanded={expanded}
							onClick={handleClickWrapped}
						/>
					)}
					<label
						{...styling(["label", "nestedNodeLabel"], ...stylingArgs)}
						onClick={handleClick}
					>
						{labelRenderer(...stylingArgs)}
					</label>
					<span
						{...styling("nestedNodeItemString", ...stylingArgs)}
						onClick={handleClick}
					>
						{renderedItemString}
					</span>
				</li>,
			);
		}

		// Render children if expanded
		if (expanded || (hideRoot && level === 0)) {
			const entries = getCollectionEntries(
				protoMode, nodeType, value,
				sortObjectKeys, collectionLimit,
			);
			result.push(...flattenEntries(
				entries, nodeType, value, keyPath, pathKey,
				options, level, circularCache,
			));
		}
	} else {
		// ── Value node (String, Number, Boolean, etc.) ──
		const valueGetter = getValueGetter(nodeType);
		const pathKey = getPathKey(keyPath);

		result.push(
			<li key={pathKey} className="treeRow" {...styling("value", nodeType, keyPath, level)}>
				<label {...styling(["label", "valueLabel"], nodeType, keyPath)}>
					{labelRenderer(keyPath, nodeType, false, false, level)}
				</label>
				<span {...styling("valueText", nodeType, keyPath)}>
					{valueRenderer(valueGetter(value), value, nodeType, ...keyPath)}
				</span>
			</li>,
		);
	}

	return result;
}
