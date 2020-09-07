import React, { Component } from "react";
import {stringify} from "javascript-stringify";
import {getItemString} from "./getItemString";
import "./TreeDiff.less";
import JSONTree from "../JSONTree";
import { diff } from "jsondiffpatch";
import { renderPath, labelRenderer, shouldExpandNode } from "../shared/sharedTreeView";
import { TPath } from "../../model/types";
import { divide } from "lodash";

function stringifyAndShrink(val:any, isWideLayout=false) {
	if (val === null) { return "null"; }

	const str = stringify(val);
	if (typeof str === "undefined") { return "undefined"; }

	if (isWideLayout) return str.length > 42 ? str.substr(0, 30) + "…" + str.substr(-10) : str;
	return str.length > 22 ? `${str.substr(0, 15)}…${str.substr(-5)}` : str;
}

//const expandFirstLevel = (keyName:TPath, data:any, level:number):boolean => (level <= 1);

function prepareDelta(value:any) {
	if (value && value._t === "a") {
		const res:any = {};
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

export interface ITreeDiffProps{
	left: any
	right: any
	path: string[]
	expandedKeys: TPath[]
	invertTheme:boolean,
	isWideLayout: boolean,
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreeDiffDispatch {
	onInspectPath: (path: string[], mode: "replace" | "add") => void;
	onSetExpandedPath: (path: TPath, expand: boolean, recursive: boolean, data:any)=>void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeDiffState{
	data:any
}

export type TTreeDiff = ITreeDiffProps & ITreeDiffDispatch

export default class TreeDiff extends Component<TTreeDiff, ITreeDiffState> {
	
	constructor(props: TTreeDiff) {
		super(props);

		this.state = {
			data: {}
		};
	}

	private labelRenderer = ([key, ...rest]: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
		return labelRenderer([key, ...rest], this.props.onInspectPath, nodeType, expanded, expandable);
	}

	private renderPath = () => {
		const { path, onInspectPath } = this.props;
		return renderPath(path, onInspectPath);
	}

	public componentDidMount():void {
		this.updateData();
	}

	public componentDidUpdate(prevProps:TTreeDiff):void {
		if (prevProps.left !== this.props.left && prevProps.right !== this.props.right) {
			this.updateData();
		}
	}

	public updateData():void {
		// this magically fixes weird React error, where it can't find a node in tree
		// if we set `delta` as JSONTree data right away
		// https://github.com/alexkuz/redux-devtools-inspector/issues/17

		const { left,right} = this.props;

		this.setState({ data: diff(left, right) });
	}

	private expandClicked = (keyPath: TPath, expanded: boolean, recursive:boolean) => {
		this.props.onSetExpandedPath(keyPath, expanded, recursive, this.state.data);
	}

	public render():React.ReactNode {
		const { ...props } = this.props;

		const { left, right } = this.props;
		const delta = this.state.data;
		if (!delta && left && right) {
			return (
				<div className="TreeDiff">
					<div className="message">Content is same</div>
				</div>
			);
		}

		if (!this.state.data) {
			return (
				<div className="TreeDiff">
					<div className="stateDiffEmpty message">
						(states are equal or missing)
					</div>
				</div>
			);
		}

		return (
			<div className="TreeDiff">
				<div className="path">
					{this.renderPath()}
				</div>

				{left && right ? <JSONTree {...props} // node module
					shouldExpandNode={shouldExpandNode(this.props.expandedKeys)}
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
			</div>
		);
	}

	public getItemString = (type: any, data: any): JSX.Element => (
		getItemString(type, data, this.props.isWideLayout, true)
	)

	public valueRenderer = (raw:any, value:any) => {
		const { /*styling,*/ isWideLayout } = this.props;

		function renderSpan(name:string, body:React.ReactNode) {
			return (
				<span key={name} /*{...styling(["diff", name])}*/ className={"diffHighlight" +" "+ name}>{body}</span>
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
	}
}