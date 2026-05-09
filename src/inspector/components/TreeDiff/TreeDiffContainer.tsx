import {connect, MapDispatchToPropsFunction} from "react-redux";
import {IRootState} from "../../../shared/store";
import {setInspectorPathDiffAction, setExpandedPathAction, setInspectorViewAction, setAutoExpandLevelAction} from "../../actions/inspectorActions";
import {getLeftTreeDiff, getRightTreeDiff, getDiffPath, getDiffExpandedNodes, getLeftRawDiff, getRightRawDiff, getDiffActiveView, getDiffExpandLevel} from "../../selectors/inspectorDiffSelectors";

import React, {Component} from "react";
import {stringify} from "javascript-stringify";
import {getItemString} from "./getItemString";
import "./TreeDiffContainer.less";
import {JSONTree} from "../react-json-tree-2";
import {diff} from "jsondiffpatch";
import {labelRenderer, shouldExpandNode} from "../sharedTreeView";
import {IDescriptor, TGenericViewType} from "../../model/types";
import {TabList} from "../Tabs/TabList";
import {TabPanel} from "../Tabs/TabListPanel";
import {VisualDiffTab} from "../VisualDiff";
import {TreePath} from "../TreePath";
import {Dispatch} from "redux";
import {KeyPath, TExpandClicked, TLabelRenderer} from "../react-json-tree-2/types";

function stringifyAndShrink(val: any, isWideLayout = false) {
	if (val === null) {return "null";}

	const str = stringify(val);
	if (typeof str === "undefined") {return "undefined";}

	if (isWideLayout) return str.length > 42 ? str.substr(0, 30) + "…" + str.substr(-10) : str;
	return str.length > 22 ? `${str.substr(0, 15)}…${str.substr(-5)}` : str;
}

//const expandFirstLevel = (keyName:TPath, data:any, level:number):boolean => (level <= 1);

function prepareDelta(value: any) {
	if (value && value._t === "a") {
		const res: any = {};
		for (const key in value) {
			if (key !== "_t") {
				if (key.startsWith("_") && !value[key.substr(1)]) {
					res[key.substr(1)] = value[key];
				} else if (value["_" + key]) {
					res[key] = [value["_" + key][0], value[key][0]];
				} else if (!value["_" + key] && !key.startsWith("_")) {
					res[key] = value[key];
				}
			}
		}
		return res;
	}

	return value;
}

const TreeDiff: React.FC<TTreeDiff> = (props) => {
	const {left, right, autoExpandLevels, onInspectPath, onSetAutoExpandLevel, path, expandedKeys} = props;

	const [data, setData] = React.useState<any>(() => diff(left, right));
	const prevLeft = React.useRef(left);
	const prevRight = React.useRef(right);

	React.useEffect(() => {
		if (prevLeft.current !== left && prevRight.current !== right) {
			setData(diff(left, right));
		}
		prevLeft.current = left;
		prevRight.current = right;
	}, [left, right]);

	const labelRendererFn: TLabelRenderer = ([key, ...rest], nodeType, expanded, expandable) => {
		return labelRenderer([key, ...rest], props.onInspectPath, nodeType, expanded, expandable);
	};

	const expandClicked: TExpandClicked = (keyPath, expanded, recursive) => {
		props.onSetExpandedPath(keyPath, expanded, recursive, data);
	};

	const getItemStringFn = (type: any, payload: any): JSX.Element => (
		getItemString(type, payload, props.isWideLayout, true)
	);

	const valueRenderer = (raw: any, value: any) => {
		const {isWideLayout} = props;

		function renderSpan(name: string, body: React.ReactNode) {
			return (
				<span key={name} className={"diffHighlight" + " " + name}>{body}</span>
			);
		}

		if (Array.isArray(value)) {
			switch (value.length) {
				case 1:
					return (
						<span className="diffWrap">
							{renderSpan("diffAdd", stringifyAndShrink(value[0], isWideLayout))}
						</span>
					);
				case 2:
					return (
						<span className="diffWrap">
							{renderSpan("diffUpdateFrom", stringifyAndShrink(value[0], isWideLayout))}
							{renderSpan("diffUpdateArrow", " => ")}
							{renderSpan("diffUpdateTo", stringifyAndShrink(value[1], isWideLayout))}
						</span>
					);
				case 3:
					return (
						<span className="diffWrap">
							{renderSpan("diffRemove", stringifyAndShrink(value[0]))}
						</span>
					);
			}
		}

		return raw;
	};

	const delta = data;

	let jsonTreeContent: JSX.Element;

	if (!delta && left && right) {
		jsonTreeContent = (
			<div className="TreeDiff">
				<div className="message">Content is same</div>
			</div>
		);
	} else if (!data) {
		jsonTreeContent = (
			<div className="TreeDiff">
				<div className="stateDiffEmpty message">
					(states are equal or missing)
				</div>
			</div>
		);
	} else {
		jsonTreeContent = (<div className="TreeDiffBox">
			{left && right ? <JSONTree {...props}
				shouldExpandNode={shouldExpandNode(expandedKeys, autoExpandLevels, true)}
				expandClicked={expandClicked}
				labelRenderer={labelRendererFn}
				data={data}
				getItemString={getItemStringFn}
				valueRenderer={valueRenderer}
				postprocessValue={prepareDelta}
				isCustomNode={Array.isArray as any}
				hideRoot={true}
				sortObjectKeys={true}
			/> : <div className="message">Select 2 descriptors. (Hold Ctrl + click on descriptor item)</div>}
		</div>);
	}

	return (
		<TabList className="tabsView" activeKey={props.viewType} onChange={props.onSetView}>
			<TabPanel id="tree" title="Tree" noPadding={true}>
				<div className="TreeDiff">
					<TreePath
						autoExpandLevels={autoExpandLevels}
						onInspectPath={onInspectPath}
						onSetAutoExpandLevel={onSetAutoExpandLevel}
						path={path}
						allowInfinityLevels={true}
					/>
					{jsonTreeContent}
				</div>
			</TabPanel>
			<TabPanel id="raw" title="Raw" >
				<TreePath
					autoExpandLevels={autoExpandLevels}
					onInspectPath={onInspectPath}
					onSetAutoExpandLevel={onSetAutoExpandLevel}
					path={path}
					allowInfinityLevels={false}
					hideLevels={true}
				/>
				<VisualDiffTab
					left={props.leftRawDiff}
					right={props.rightRawDiff}
				/>
			</TabPanel>
		</TabList>
	);
};


type TTreeDiff = ITreeDiffProps & ITreeDiffDispatch

interface ITreeDiffState {
	data: any
}

interface ITreeDiffProps {
	left: any
	right: any
	path: KeyPath
	expandedKeys: KeyPath[]
	invertTheme: boolean,
	isWideLayout: boolean,
	leftRawDiff: IDescriptor | null
	rightRawDiff: IDescriptor | null
	viewType: TGenericViewType
	autoExpandLevels: number
}

const mapStateToProps = (state: IRootState): ITreeDiffProps => ({
	left: getLeftTreeDiff(state),
	right: getRightTreeDiff(state),
	path: getDiffPath(state),
	invertTheme: false,
	isWideLayout: true,
	expandedKeys: getDiffExpandedNodes(state),
	rightRawDiff: getRightRawDiff(state),
	leftRawDiff: getLeftRawDiff(state),
	viewType: getDiffActiveView(state),
	autoExpandLevels: getDiffExpandLevel(state),
});

interface ITreeDiffDispatch {
	onInspectPath: (path: KeyPath, mode: "replace" | "add") => void;
	onSetExpandedPath: (path: KeyPath, expand: boolean, recursive: boolean, data: any) => void;
	onSetView: (viewType: TGenericViewType) => void
	onSetAutoExpandLevel: (level: number) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeDiffDispatch, Record<string, unknown>> = (dispatch: Dispatch): ITreeDiffDispatch => ({
	onInspectPath: (path, mode) => dispatch(setInspectorPathDiffAction(path, mode)),
	onSetExpandedPath: (path, expand, recursive, data) => dispatch(setExpandedPathAction("difference", path, expand, recursive, data)),
	onSetView: (viewType) => dispatch(setInspectorViewAction("diff", viewType)),
	onSetAutoExpandLevel: (level) => dispatch(setAutoExpandLevelAction("diff", level)),
});

export const TreeDiffContainer = connect<ITreeDiffProps, ITreeDiffDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(TreeDiff);