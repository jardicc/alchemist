import React, { Component } from "react";
import {stringify} from "javascript-stringify";
import {getItemString} from "./getItemString";
import "./JSONDiff.less";
import JSONTree from "../JSONTree";
import { IconPin } from "../../../shared/components/icons";

function stringifyAndShrink(val:any, isWideLayout=false) {
	if (val === null) { return "null"; }

	const str = stringify(val);
	if (typeof str === "undefined") { return "undefined"; }

	if (isWideLayout) return str.length > 42 ? str.substr(0, 30) + "…" + str.substr(-10) : str;
	return str.length > 22 ? `${str.substr(0, 15)}…${str.substr(-5)}` : str;
}

const expandFirstLevel = (keyName:(string | number)[], data:any, level:number):boolean => (level <= 1);

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

export interface IJSONDiffProps{
	delta:any,
	//styling:any,
	invertTheme:boolean,
	isWideLayout: boolean,
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IJSONDiffDispatch {
	onInspectPath: (path: string[],mode:"replace"|"add") => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IJSONDiffState{
	data:any
}

export type TJSONDiff = IJSONDiffProps & IJSONDiffDispatch

export default class JSONDiff extends Component<TJSONDiff, IJSONDiffState> {
	
	constructor(props: TJSONDiff) {
		super(props);

		this.state = {
			data: {}
		};
	}

	private inspectPath = ([key, ...rest]: string[]) => {
		this.props.onInspectPath([
			...[key, ...rest].reverse()
		],"add");
	}

	
	private labelRenderer = ([key, ...rest]: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
		
		let noPin = false;
		if (typeof key === "string") {			
			noPin = key.startsWith("$$$noPin_");
			key = key.replace("$$$noPin_", "");
		}
		return (
			<span>
				<span className={"treeItemKey" + (expandable?" expandable":"")}>
					{key}
				</span>
				{(noPin) ? null : <span
					className="treeItemPin"
					onClick={() => this.inspectPath([key, ...rest])}
				>
					<IconPin />
				</span>}
				{!expanded && ": "}
			</span>
		);
	}

	public componentDidMount():void {
		this.updateData();
	}

	public componentDidUpdate(prevProps:any):void {
		if (prevProps.delta !== this.props.delta) {
			this.updateData();
		}
	}

	public updateData():void {
		// this magically fixes weird React error, where it can't find a node in tree
		// if we set `delta` as JSONTree data right away
		// https://github.com/alexkuz/redux-devtools-inspector/issues/17

		this.setState({ data: this.props.delta });
	}

	public render():React.ReactNode {
		const { ...props } = this.props;

		if (!this.state.data) {
			return (
				<div /*{...styling("stateDiffEmpty")}*/ className="stateDiffEmpty">
					(states are equal)
				</div>
			);
		}

		return (
			<div className="JSONDiff">				
				<JSONTree {...props} // node module
					labelRenderer={this.labelRenderer}
					data={this.state.data}
					getItemString={this.getItemString}
					valueRenderer={this.valueRenderer}
					postprocessValue={prepareDelta}
					isCustomNode={Array.isArray as any}
					shouldExpandNode={expandFirstLevel}
					hideRoot={true}
					sortObjectKeys={true}
				/>
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