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
	const [, setRenderTick] = useState(0);
	const handleToggle = useCallback(() => setRenderTick((t) => t + 1), []);

	const items = flattenTree(
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
	);

	//console.log("JSONTree flat items:", items.length);

	return (
		<ul {...styling("tree")}>
			<VirtualScroll
				fixedHeight={400}
				itemHeight={16}
				overscan={5}
				items={items}
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
