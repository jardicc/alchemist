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
		if ("to" in entry && "from" in entry) {
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
		} else if ("key" in entry) {
			const {key, value: childValue} = entry;
			const childIsCircular = circularCache.has(childValue);
			const childKeyPath: KeyPath = [key, ...keyPath];
			circularCache.add(childValue);
			collectNode(
				out,
				postprocessValue(childValue),
				childKeyPath,
				options,
				level + 1,
				circularCache,
				childIsCircular,
			);
			circularCache.delete(childValue);
		}
	}
}

function collectNode(
	out: RowDescriptor[],
	value: unknown,
	keyPath: KeyPath,
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
		const expandable = !isCircular && isExpandable(nodeType, value);
		const pathKey = getPathKey(keyPath);
		const nodeTypeIndicator = getNodeTypeIndicator(nodeType)!;

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

		if (!(hideRoot && level === 0)) {
			out.push({
				kind: RowKind.Nested,
				pathKey,
				keyPath,
				nodeType,
				nodeTypeIndicator,
				expanded,
				expandable,
				level,
				value,
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
		const pathKey = getPathKey(keyPath);
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
	const {styling, labelRenderer, getItemString, expandedPaths, onToggle, expandClicked, collectionLimit} = options;
	const {pathKey, keyPath, nodeType, nodeTypeIndicator, expanded, expandable, level} = row;
	const stylingArgs: TStylingArgs = [keyPath, nodeType, expanded, expandable, level];

	const handleClick = expandable ? () => {
		expandedPaths.set(pathKey, !expanded);
		onToggle();
	} : undefined;

	const handleClickWrapped = expandable ? (e: React.MouseEvent<HTMLDivElement>) => {
		const path = [...keyPath].reverse();
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
		createItemStringForType(nodeType, row.value, collectionLimit),
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
	collectNode(descriptors, value, keyPath, options, level, circularCache, false);

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
