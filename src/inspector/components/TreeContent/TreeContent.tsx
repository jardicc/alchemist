import React, { Component } from "react";
import "./TreeContent.less";
import { getItemString } from "../JSONDiff/getItemString";
import JSONTree from "./../JSONTree";
import { IconPin } from "../../../shared/components/icons";
import { TProtoMode } from "../../model/types";

export interface ITreeContentProps{
	content: any
	path: string[]
	protoMode:TProtoMode
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreeContentDispatch {
	onInspectPath: (path: string[],mode:"replace"|"add") => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeContentState{
	
}

export type TTreeContent = ITreeContentProps & ITreeContentDispatch

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

	public getItemString = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	}
	
	public render(): React.ReactNode {
		const { content,protoMode } = this.props;
		//console.log(content);
		return (
			<div className="TreeContent">
				<div className="path">
					{this.renderPath()}
				</div>
				
				{(content === undefined || content === null) ?
					"Content is missing. Please make sure that you selected descriptor and your pinned property exists"
					:
					<JSONTree
						labelRenderer={this.labelRenderer}
						data={content}
						getItemString={this.getItemString} // shows object content shortcut
						invertTheme={false}
						hideRoot={true}
						sortObjectKeys={true}
						protoMode={protoMode}
					/>					
				}
			</div>
		);
	}
}