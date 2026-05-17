import React from "react";
import {objType} from "./objType";
import getCollectionEntries from "./getCollectionEntries";
import JSONArrow from "./JSONArrow";
import type {
	KeyPath, GetItemString, TLabelRenderer, ValueRenderer,
	ShouldExpandNodeInitially, PostprocessValue, IsCustomNode,
	SortObjectKeys, Styling, TNodeType, TStylingArgs, TExpandClicked,
	TProtoMode, TShouldExpandNode,
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

// ── Descriptor types (plain objects, no JSX) ──

const enum RowKind {
	Nested = 0,
	Value = 1,
	Range = 2,
}

interface NestedRow {
	kind: RowKind.Nested;
	pathKey: string;
	keyPath: KeyPath;
	nodeType: TNodeType;
	nodeTypeIndicator: string;
	expanded: boolean;
	expandable: boolean;
	level: number;
	value: unknown;
	itemString: string;
}

interface ValueRow {
	kind: RowKind.Value;
	pathKey: string;
	keyPath: KeyPath;
	nodeType: TNodeType;
	level: number;
	value: unknown;
}

interface RangeRow {
	kind: RowKind.Range;
	rangeKey: string;
	nodeType: TNodeType;
	from: number;
	to: number;
}

type RowDescriptor = NestedRow | ValueRow | RangeRow;

export interface FlattenResult {
	descriptors: RowDescriptor[];
	renderItem: (index: number) => React.ReactElement;
}

// ── Cached value getters ──

const valueGetters: Partial<Record<TNodeType, (raw: any) => unknown>> = {
	String: (raw: string) => `"${raw}"`,
	Number: (raw: any) => raw,
	Boolean: (raw: boolean) => (raw ? "true" : "false"),
	Date: (raw: Date) => raw.toISOString(),
	Null: () => "null",
	Undefined: () => "undefined",
	Function: (raw: any) => raw.toString(),
	AsyncFunction: (raw: any) => raw.toString(),
	GeneratorFunction: (raw: any) => raw.toString(),
	Symbol: (raw: any) => raw.toString(),
	Custom: (raw: any) => raw,
};
const defaultValueGetter = (raw: any) => raw;

// ── Helpers ──

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

// Computes both expandable flag and itemString in one pass, avoiding duplicate
// Object.getOwnPropertyNames / iterator walks for the same value.
function computeNestedMeta(
	nodeType: TNodeType,
	data: unknown,
	collectionLimit: number,
): {expandable: boolean; itemString: string} {
	switch (nodeType) {
		case "Object": case "Error": case "WeakMap": case "WeakSet": {
			const len = Object.getOwnPropertyNames(data).length;
			return {
				expandable: len > 0,
				itemString: `${len} ${len !== 1 ? "keys" : "key"}`,
			};
		}
		case "Array": {
			const len = (data as unknown[]).length;
			return {
				expandable: len > 0,
				itemString: `${len} ${len !== 1 ? "items" : "item"}`,
			};
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
			return {
				expandable: true,
				itemString: `${hasMore ? ">" : ""}${count} ${count !== 1 ? "entries" : "entry"}`,
			};
		}
		default: return {expandable: false, itemString: ""};
	}
}

// ── Phase 1: Build descriptor array (cheap, no JSX) ──

function collectEntries(
	out: RowDescriptor[],
	entries: any[],
	nodeType: TNodeType,
	data: unknown,
	keyPath: KeyPath,
	parentPathKey: string,
	options: FlattenTreeOptions,
	level: number,
	circularCache: Set<unknown>,
): void {
	const {postprocessValue, protoMode, sortObjectKeys, collectionLimit, expandedPaths} = options;

	for (let i = 0, len = entries.length; i < len; i++) {
		const entry = entries[i];
		if (typeof entry.from === "number") {
			const rangeKey = `${parentPathKey}/ItemRange--${entry.from}-${entry.to}`;
			const rangeExpanded = expandedPaths.get(rangeKey) ?? false;

			if (rangeExpanded) {
				const subEntries = getCollectionEntries(
					protoMode, nodeType, data,
					sortObjectKeys, collectionLimit, entry.from, entry.to,
				);
				collectEntries(
					out, subEntries, nodeType, data, keyPath, rangeKey,
					options, level, circularCache,
				);
			} else {
				out.push({
					kind: RowKind.Range,
					rangeKey,
					nodeType,
					from: entry.from,
					to: entry.to,
				});
			}
		} else {
			const {key, value: childValue} = entry;
			const isObj = childValue !== null
				&& (typeof childValue === "object" || typeof childValue === "function");
			const childIsCircular = isObj && circularCache.has(childValue);
			const childKeyPath: KeyPath = [key, ...keyPath];
			const childPathKey = parentPathKey === ""
				? String(key)
				: `${key}/${parentPathKey}`;
			if (isObj) circularCache.add(childValue);
			collectNode(
				out,
				postprocessValue(childValue),
				childKeyPath,
				childPathKey,
				options,
				level + 1,
				circularCache,
				childIsCircular,
			);
			if (isObj) circularCache.delete(childValue);
		}
	}
}

function collectNode(
	out: RowDescriptor[],
	value: unknown,
	keyPath: KeyPath,
	pathKey: string,
	options: FlattenTreeOptions,
	level: number,
	circularCache: Set<unknown>,
	isCircular: boolean,
): void {
	const {
		isCustomNode, collectionLimit, sortObjectKeys, protoMode,
		hideRoot, expandedPaths,
		shouldExpandNodeInitially, shouldExpandNode,
	} = options;

	const nodeType = isCustomNode(value) ? "Custom" : objType(value);

	if (isNestedType(nodeType)) {
		const meta = isCircular
			? {expandable: false, itemString: ""}
			: computeNestedMeta(nodeType, value, collectionLimit);
		const nodeTypeIndicator = getNodeTypeIndicator(nodeType)!;

		let expanded: boolean;
		if (isCircular) {
			expanded = false;
		} else {
			const stored = expandedPaths.get(pathKey);
			if (stored !== undefined) {
				expanded = stored;
			} else {
				expanded = shouldExpandNodeInitially(keyPath, value, level);
				expandedPaths.set(pathKey, expanded);
			}
		}
		expanded = expanded || shouldExpandNode(keyPath, value, level);

		if (!(hideRoot && level === 0)) {
			out.push({
				kind: RowKind.Nested,
				pathKey,
				keyPath,
				nodeType,
				nodeTypeIndicator,
				expanded,
				expandable: meta.expandable,
				level,
				value,
				itemString: meta.itemString,
			});
		}

		if (expanded || (hideRoot && level === 0)) {
			const entries = getCollectionEntries(
				protoMode, nodeType, value,
				sortObjectKeys, collectionLimit,
			);
			collectEntries(
				out, entries, nodeType, value, keyPath, pathKey,
				options, level, circularCache,
			);
		}
	} else {
		out.push({
			kind: RowKind.Value,
			pathKey,
			keyPath,
			nodeType,
			level,
			value,
		});
	}
}

// ── Phase 2: Render a single descriptor to JSX (only called for visible rows) ──

function renderNestedRow(
	row: NestedRow,
	options: FlattenTreeOptions,
): React.ReactElement {
	const {styling, labelRenderer, getItemString, expandedPaths, onToggle, expandClicked} = options;
	const {pathKey, keyPath, nodeType, nodeTypeIndicator, expanded, expandable, level, itemString} = row;
	const stylingArgs: TStylingArgs = [keyPath, nodeType, expanded, expandable, level];

	const handleClick = expandable ? () => {
		expandedPaths.set(pathKey, !expanded);
		onToggle();
	} : undefined;

	const handleClickWrapped = expandable ? (e: React.MouseEvent<HTMLDivElement>) => {
		const path = keyPath.slice().reverse();
		expandClicked(path, !expanded, e.altKey);
		expandedPaths.set(pathKey, !expanded);
		onToggle();
	} : undefined;

	const itemType = (
		<span {...styling("nestedNodeItemType", expanded)}>
			{nodeTypeIndicator}
		</span>
	);
	const renderedItemString = getItemString(
		nodeType, row.value, itemType,
		itemString,
		keyPath,
	);

	return (
		<li key={pathKey} className="treeRow" {...styling("nestedNode", ...stylingArgs)}>
			{expandable && (
				<JSONArrow
					styling={styling}
					nodeType={nodeType}
					expanded={expanded}
					onClick={handleClickWrapped!}
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
		</li>
	);
}

function renderValueRow(
	row: ValueRow,
	options: FlattenTreeOptions,
): React.ReactElement {
	const {styling, labelRenderer, valueRenderer} = options;
	const {pathKey, keyPath, nodeType, level, value} = row;
	const valueGetter = valueGetters[nodeType] ?? defaultValueGetter;

	return (
		<li key={pathKey} className="treeRow" {...styling("value", nodeType, keyPath, level)}>
			<label {...styling(["label", "valueLabel"], nodeType, keyPath)}>
				{labelRenderer(keyPath, nodeType, false, false, level)}
			</label>
			<span {...styling("valueText", nodeType, keyPath)}>
				{valueRenderer(valueGetter(value), value, nodeType, ...keyPath)}
			</span>
		</li>
	);
}

function renderRangeRow(
	row: RangeRow,
	options: FlattenTreeOptions,
): React.ReactElement {
	const {styling, expandedPaths, onToggle} = options;
	const {rangeKey, nodeType, from, to} = row;

	const handleRangeClick = () => {
		expandedPaths.set(rangeKey, true);
		onToggle();
	};

	return (
		<li key={rangeKey} className="treeRow" {...styling("itemRange", false)} onClick={handleRangeClick}>
			<JSONArrow
				nodeType={nodeType}
				styling={styling}
				expanded={false}
				onClick={handleRangeClick}
				arrowStyle="double"
			/>
			{`${from} ... ${to}`}
		</li>
	);
}

// ── Public API ──

export function flattenTree(
	value: unknown,
	keyPath: KeyPath,
	options: FlattenTreeOptions,
	level = 0,
): FlattenResult {
	const descriptors: RowDescriptor[] = [];
	const circularCache = new Set<unknown>();
	// Root pathKey is built once from the input keyPath (same shape as before:
	// children prepend their key separated by "/", matching the original
	// `keyPath.join("/")` semantics since children use [key, ...keyPath]).
	const rootPathKey = keyPath.join("/");
	collectNode(descriptors, value, keyPath, rootPathKey, options, level, circularCache, false);

	const renderItem = (index: number): React.ReactElement => {
		const row = descriptors[index];
		switch (row.kind) {
			case RowKind.Nested: return renderNestedRow(row, options);
			case RowKind.Value: return renderValueRow(row, options);
			case RowKind.Range: return renderRangeRow(row, options);
		}
	};

	return {descriptors, renderItem};
}
