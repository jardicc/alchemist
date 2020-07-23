import React, { Component } from "react";
import "./TreeContent.less";
import { getItemString } from "../JSONDiff/getItemString";
import JSONTree from "react-json-tree";

export interface ITreeContentProps{
	content: any
	path:string[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreeContentDispatch {
	onInspectPath: (path: string[],mode:"replace"|"add") => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeContentState{
	
}

export type TTreeContent = ITreeContentProps & ITreeContentDispatch

const theme = {
	scheme: "monokai",
	author: "wimer hazenberg (http://www.monokai.nl)",
	base00: "#272822",
	base01: "#383830",
	base02: "#49483e",
	base03: "#75715e",
	base04: "#a59f85",
	base05: "#f8f8f2",
	base06: "#f5f4f1",
	base07: "#f9f8f5",
	base08: "#f92672",
	base09: "#fd971f",
	base0A: "#f4bf75",
	base0B: "#a6e22e",
	base0C: "#a1efe4",
	base0D: "#66d9ef",
	base0E: "#ae81ff",
	base0F: "#cc6633"
};

export class TreeContent extends Component<TTreeContent, ITreeContentState> {

	constructor(props: TTreeContent) {
		super(props);

		this.state = {
		};
	}

	private inspectPath = ([key, ...rest]: string[]) => {
		this.props.onInspectPath([
			...[key, ...rest].reverse()
		],"add");
	}

	
	private labelRenderer = ([key, ...rest]: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
		console.log(key,nodeType, expandable);
		return (
			<span>
				<span className="treeItemKey">
					{key}
				</span>
				{!expandable ? null : <span
					className="treeItemPin"
					onClick={() => this.inspectPath([key, ...rest])}
				>
					{"(pin)"}
				</span>}
				{!expanded && ": "}
			</span>
		);
	}

	private renderPath = () => {
		const { path, onInspectPath } = this.props;
		const parts: React.ReactNode[] = [
			<span className="pathItem" key="root" onClick={() => { onInspectPath([],"replace"); }}>
				<span className="link">root</span>
			</span>
		];
		for (let i = 0, len = path.length; i < len; i++) {
			parts.push(
				<span className="pathItem" key={i} onClick={() => { onInspectPath(path.slice(0, i + 1),"replace"); }}>
					<span className="link">{path[i]}</span>
				</span>
			);
		}
		return parts;
	}

	public getItemString = (type: any, data: any): JSX.Element => (
		getItemString(type, data, true, true)
	)
	
	public render(): React.ReactNode {
		const { content } = this.props;
		if (!content) {
			return "Content is missing. Please make sure that you selected descriptor and your pinned property exists";
		}

		return (
			<div className="TreeContent">
				<div className="path">
					{this.renderPath()}
				</div>

				<JSONTree
					labelRenderer={this.labelRenderer}
					theme={theme}
					data={content}
					getItemString={this.getItemString}
					invertTheme={false}
					hideRoot={true}
				/>
			</div>
		);
	}
}