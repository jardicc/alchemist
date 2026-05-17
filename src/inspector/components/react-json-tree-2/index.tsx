// ES6 + inline style port of JSONViewer https://bitbucket.org/davevedder/react-json-viewer/
// all credits and original code to the author
// Dave Vedder <veddermatic@gmail.com> http://www.eskimospy.com/
// port by Daniele Zannotti http://www.github.com/dzannotti <dzannotti@me.com>

import React, {useCallback, useRef, useMemo, useState} from "react";
import createStylingFromTheme from "./createStylingFromTheme";
import {invertTheme} from "react-base16-styling";
import type {StylingValue, Theme} from "react-base16-styling";
import type {
	CommonExternalProps,
	GetItemString,
	IsCustomNode,
	TLabelRenderer,
	ShouldExpandNodeInitially,
	ValueRenderer,
} from "./types";
import {VirtualScroll} from "../VirtualScroll";
import {flattenTree} from "./flattenTree";

interface Props extends Partial<CommonExternalProps> {
	data: any;
	theme?: Theme;
	invertTheme?: boolean;
}

const identity: ValueRenderer = (displayValue, rawValue, nodeType, ...keyPath): React.ReactNode => {
	if (nodeType === "Function") {
		return "<Function>";
	}
	if (nodeType === "AsyncFunction") {
		return "<AsyncFunction>";
	}
	if (nodeType === "GeneratorFunction") {
		return "<GeneratorFunction>";
	}
	return displayValue;
};
const expandRootNode: ShouldExpandNodeInitially = (keyPath, data, level) =>
	level === 0;
const defaultItemString: GetItemString = (type, data, itemType, itemString) => (
	<span>
		{itemType} {itemString}
	</span>
);
const defaultLabelRenderer: TLabelRenderer = ([label]) => <span>{label}:</span>;
const noCustomNode: IsCustomNode = () => false;

export function JSONTree({
	data: value,
	theme,
	invertTheme: shouldInvertTheme,
	keyPath = ["root"],
	labelRenderer = defaultLabelRenderer,
	valueRenderer = identity,
	shouldExpandNodeInitially = expandRootNode,
	hideRoot = false,
	getItemString = defaultItemString,
	postprocessValue = identity,
	isCustomNode = noCustomNode,
	collectionLimit = 200,
	sortObjectKeys = false,
	shouldExpandNode = () => false,
	expandClicked = () => { },
	protoMode = "none",
}: Props) {
	const styling = useMemo(
		() =>
			createStylingFromTheme(shouldInvertTheme ? invertTheme(theme) : theme),
		[theme, shouldInvertTheme],
	);

	const expandedPathsRef = useRef(new Map<string, boolean>());
	const [renderTick, setRenderTick] = useState(0);
	const handleToggle = useCallback(() => { setRenderTick((t) => t + 1); }, []);

	const {descriptors, renderItem} = useMemo(
		() => flattenTree(
			postprocessValue(value),
			hideRoot ? [] : keyPath,
			{
				styling,
				labelRenderer,
				valueRenderer,
				getItemString,
				postprocessValue,
				isCustomNode,
				collectionLimit,
				sortObjectKeys,
				protoMode,
				hideRoot,
				expandedPaths: expandedPathsRef.current,
				onToggle: handleToggle,
				expandClicked,
				shouldExpandNodeInitially,
				shouldExpandNode,
			},
		),
		// renderTick is the version of the mutable expandedPaths Map: every toggle
		// bumps it so we rebuild only then. All other parent re-renders reuse the
		// previous descriptors/renderItem references (no tree walk, stable VirtualScroll props).
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			value, hideRoot, keyPath, styling, labelRenderer, valueRenderer,
			getItemString, postprocessValue, isCustomNode, collectionLimit,
			sortObjectKeys, protoMode, expandClicked,
			shouldExpandNodeInitially, shouldExpandNode, handleToggle, renderTick,
		],
	);

	return (
		<ul style={{
			    fontFamily: 'Consolas, "Courier New", Monaco, "Lucida Console"',
				padding: 0,
				border: 0,
		}}>
			<VirtualScroll
				//fixedHeight={400}
				//renderPlaceholder={(index) => <div>{index}</div>}
				flex={true}
				itemHeight={16}
				overscan={40}
				itemCount={descriptors.length}
				renderItem={renderItem}
			/>
		</ul>
	);
}

export type {
	Key,
	KeyPath,
	GetItemString,
	TLabelRenderer,
	ValueRenderer,
	ShouldExpandNodeInitially,
	PostprocessValue,
	IsCustomNode,
	SortObjectKeys,
	Styling,
	CommonExternalProps,
} from "./types";
export type {StylingValue};
