import {connect, MapDispatchToPropsFunction} from "react-redux";
import {IRootState} from "../../../shared/store";
import {setInspectorPathDiffAction, setExpandedPathAction, setInspectorViewAction, setAutoExpandLevelAction} from "../../actions/inspectorActions";
import {getLeftTreeDiff, getRightTreeDiff, getDiffPath, getDiffExpandedNodes, getLeftRawDiff, getRightRawDiff, getDiffActiveView, getDiffExpandLevel} from "../../selectors/inspectorDiffSelectors";

import React, {Component} from "react";
import {stringify} from "javascript-stringify";
import {getItemString} from "./getItemString";
import "./TreeDiff.less";
import {JSONTree} from "../JSONTree";
import {diff} from "jsondiffpatch";
import {labelRenderer, shouldExpandNode} from "../shared/sharedTreeView";
import {IDescriptor, TPath, TGenericViewType} from "../../model/types";
import {TabList} from "../Tabs/TabList";
import {TabPanel} from "../Tabs/TabPanel";
import {VisualDiffTab} from "../VisualDiff/VisualDiff";
import {TreePath} from "../TreePath/TreePath";
import {Dispatch} from "redux";

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
				if (key[0] === "_" && !value[key.substr(1)]) {
					res[key.substr(1)] = value[key];
				} else if (value["_" + key]) {
					res[key] = [value["_" + key][0], value[key][0]];
				} else if (!value["_" + key] && key[0] !== "_") {
					res[key] = value[key];
				}
			}
		}
		return res;
	}

	return value;
}

class TreeDiff extends Component<TTreeDiff, ITreeDiffState> {

	constructor(props: TTreeDiff) {
		super(props);

		this.state = {
			data: {},
		};
	}

	private labelRenderer = ([key, ...rest]: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
		return labelRenderer([key, ...rest], this.props.onInspectPath, nodeType, expanded, expandable);
	};

	public override componentDidMount(): void {
		this.updateData();
	}

	public override componentDidUpdate(prevProps: TTreeDiff): void {
		if (prevProps.left !== this.props.left && prevProps.right !== this.props.right) {
			this.updateData();
		}
	}

	public updateData(): void {
		// this magically fixes weird React error, where it can't find a node in tree
		// if we set `delta` as JSONTree data right away
		// https://github.com/alexkuz/redux-devtools-inspector/issues/17

		const {left, right} = this.props;

		this.setState({data: diff(left, right)});
	}

	private expandClicked = (keyPath: TPath, expanded: boolean, recursive: boolean) => {
		this.props.onSetExpandedPath(keyPath, expanded, recursive, this.state.data);
	};

	public override render(): React.ReactNode {
		const {...props} = this.props;

		const {left, right, autoExpandLevels, onInspectPath, onSetAutoExpandLevel, path, expandedKeys} = this.props;
		const delta = this.state.data;

		let jsonTreeContent: JSX.Element;

		if (!delta && left && right) {
			jsonTreeContent = (
				<div className="TreeDiff">
					<div className="message">Content is same</div>
				</div>
			);
		} else if (!this.state.data) {
			jsonTreeContent = (
				<div className="TreeDiff">
					<div className="stateDiffEmpty message">
						(states are equal or missing)
					</div>
				</div>
			);
		} else {
			jsonTreeContent = (<div className="TreeDiffBox">
				{left && right ? <JSONTree {...props} // node module
					shouldExpandNode={shouldExpandNode(expandedKeys, autoExpandLevels, true)}
					expandClicked={this.expandClicked}
					labelRenderer={this.labelRenderer}
					data={this.state.data}
					getItemString={this.getItemString}
					valueRenderer={this.valueRenderer}
					postprocessValue={prepareDelta}
					isCustomNode={Array.isArray as any}
					hideRoot={true}
					sortObjectKeys={true}
				/> : <div className="message">Select 2 descriptors. (Hold Ctrl + click on descriptor item)</div>}
			</div>);
		}


		return (
			<TabList className="tabsView" activeKey={this.props.viewType} onChange={this.props.onSetView}>
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
					<VisualDiffTab
						left={this.props.leftRawDiff}
						right={this.props.rightRawDiff}
					/>
				</TabPanel>
			</TabList>
		);
	}

	public getItemString = (type: any, data: any): JSX.Element => (
		getItemString(type, data, this.props.isWideLayout, true)
	);

	public valueRenderer = (raw: any, value: any) => {
		const { /*styling,*/ isWideLayout} = this.props;

		function renderSpan(name: string, body: React.ReactNode) {
			return (
				<span key={name} /*{...styling(["diff", name])}*/ className={"diffHighlight" + " " + name}>{body}</span>
			);
		}

		if (Array.isArray(value)) {
			switch (value.length) {
				case 1:
					return (
						<span /*{...styling("diffWrap")}*/ className="diffWrap">
							{renderSpan("diffAdd", stringifyAndShrink(value[0], isWideLayout))}
						</span>
					);
				case 2:
					return (
						<span /*{...styling("diffWrap")}*/ className="diffWrap">
							{renderSpan("diffUpdateFrom", stringifyAndShrink(value[0], isWideLayout))}
							{renderSpan("diffUpdateArrow", " => ")}
							{renderSpan("diffUpdateTo", stringifyAndShrink(value[1], isWideLayout))}
						</span>
					);
				case 3:
					return (
						<span /*{...styling("diffWrap")}*/ className="diffWrap">
							{renderSpan("diffRemove", stringifyAndShrink(value[0]))}
						</span>
					);
			}
		}

		return raw;
	};
}


type TTreeDiff = ITreeDiffProps & ITreeDiffDispatch

interface ITreeDiffState {
	data: any
}

interface ITreeDiffProps {
	left: any
	right: any
	path: string[]
	expandedKeys: TPath[]
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
	onInspectPath: (path: string[], mode: "replace" | "add") => void;
	onSetExpandedPath: (path: TPath, expand: boolean, recursive: boolean, data: any) => void;
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