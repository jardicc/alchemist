import React, {useCallback, useState} from "react";
import JSONArrow from "./JSONArrow";
import getCollectionEntries from "./getCollectionEntries";
import JSONNode from "./JSONNode";
import ItemRange from "./ItemRange";
import type {CircularCache, CommonInternalProps, TNodeType, TStylingArgs} from "./types";

/**
 * Renders nested values (eg. objects, arrays, lists, etc.)
 */

export interface RenderChildNodesProps extends CommonInternalProps {
	data: unknown;
	nodeType: TNodeType;
	circularCache: CircularCache;
	level: number;
}

interface Range {
	from: number;
	to: number;
}

interface Entry {
	key: string | number;
	value: unknown;
}

function isRange(rangeOrEntry: Range | Entry): rangeOrEntry is Range {
	return (rangeOrEntry as Range).to !== undefined;
}

function renderChildNodes(
	props: RenderChildNodesProps,
	from?: number,
	to?: number,
) {
	const {
		nodeType,
		data,
		collectionLimit,
		circularCache,
		keyPath,
		postprocessValue,
		sortObjectKeys,
		protoMode,
	} = props;
	const childNodes: React.ReactNode[] = [];

	getCollectionEntries(
		protoMode,
		nodeType,
		data,
		sortObjectKeys,
		collectionLimit,
		from,
		to,
	).forEach((entry) => {
		if (isRange(entry)) {
			childNodes.push(
				<ItemRange
					{...props}
					key={`ItemRange--${entry.from}-${entry.to}`}
					from={entry.from}
					to={entry.to}
					renderChildNodes={renderChildNodes}
				/>,
			);
		} else {
			const {key, value} = entry;
			const isCircular = circularCache.indexOf(value) !== -1;

			childNodes.push(
				<JSONNode
					{...props}
					{...{postprocessValue, collectionLimit}}
					key={`Node--${key}`}
					keyPath={[key, ...keyPath]}
					value={postprocessValue(value)}
					circularCache={[...circularCache, value]}
					isCircular={isCircular}
					hideRoot={false}
				/>,
			);
		}
	});

	return childNodes;
}

interface Props extends CommonInternalProps {
	data: unknown;
	nodeType: TNodeType;
	nodeTypeIndicator: string;
	createItemString: (data: unknown, collectionLimit: number) => string;
	expandable: boolean;
}

function hasToBeExpanded(props: Props) {
	const {
		data,
		keyPath,
		level,
		shouldExpandNode,
	} = props;
	const expanded: boolean = shouldExpandNode(keyPath, data, level);
	return expanded;
}

export default function JSONNestedNode(props: Props) {
	const {
		circularCache = [],
		shouldExpandNode,
		collectionLimit,
		createItemString,
		data,
		expandable,
		getItemString,
		hideRoot,
		isCircular,
		keyPath,
		labelRenderer,
		level = 0,
		nodeType,
		nodeTypeIndicator,
		shouldExpandNodeInitially,
		styling,
		expandClicked,
	} = props;

	let [expanded, setExpanded] = useState<boolean>(
		// calculate individual node expansion if necessary
		isCircular ? false : shouldExpandNodeInitially(keyPath, data, level),
	);

	const handleClick = useCallback(
		() => {
			if (expandable) {
				setExpanded(!expanded);
			}
		},
		[expandable, expanded],
	);

	const handleClickWrapped = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
		if (expandable) {
			let path = [...keyPath];
			path = path.reverse();
			expandClicked(path, !expanded, e.altKey);
		}
		handleClick();
	};



	expanded = expanded || hasToBeExpanded(props);

	const renderedChildren =
		expanded || (hideRoot && level === 0)
			? renderChildNodes({...props, circularCache, level: level + 1})
			: null;

	const itemType = (
		<span {...styling("nestedNodeItemType", expanded)}>
			{nodeTypeIndicator}
		</span>
	);
	const renderedItemString = getItemString(
		nodeType,
		data,
		itemType,
		createItemString(data, collectionLimit),
		keyPath,
	);
	const stylingArgs: TStylingArgs = [keyPath, nodeType, expanded, expandable];

	return hideRoot ? (
		<li {...styling("rootNode", ...stylingArgs)}>
			<ul {...styling("rootNodeChildren", ...stylingArgs)}>
				{renderedChildren}
			</ul>
		</li>
	) : (
		<li {...styling("nestedNode", ...stylingArgs)}>
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
			<ul {...styling("nestedNodeChildren", ...stylingArgs)}>
				{renderedChildren}
			</ul>
		</li>
	);
}