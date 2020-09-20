import React, { Component } from "react";
import "./TreeContent.less";
import { getItemString } from "../TreeDiff/getItemString";
import JSONTree from "./../JSONTree";
import { TProtoMode, TPath, TGenericViewType } from "../../model/types";
import { renderPath, labelRenderer, shouldExpandNode } from "../shared/sharedTreeView";
import { TLabelRenderer } from "../JSONTree/types";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";

export interface ITreeContentProps{
	content: any
	path: string[]
	expandedKeys: TPath[]
	protoMode: TProtoMode
	descriptorContent: string
	viewType:TGenericViewType
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreeContentDispatch {
	onInspectPath: (path: string[], mode: "replace" | "add") => void;
	onSetExpandedPath: (path: TPath, expand: boolean, recursive: boolean, data: any) => void;
	onSetView: (viewType: TGenericViewType) => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeContentState{
	
}

export type TTreeContent = ITreeContentProps & ITreeContentDispatch

export class TreeContent extends Component<TTreeContent, ITreeContentState> {

	constructor(props: TTreeContent) {
		super(props);
	}
	
	private labelRenderer:TLabelRenderer = ([key, ...rest], nodeType, expanded, expandable): JSX.Element => {
		return labelRenderer([key, ...rest], this.props.onInspectPath, nodeType, expanded, expandable);
	}

	private renderPath = () => {
		const { path, onInspectPath } = this.props;
		return renderPath(path, onInspectPath);
	}

	public getItemString = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	}

	private expandClicked = (keyPath: TPath, expanded: boolean, recursive:boolean) => {
		this.props.onSetExpandedPath(keyPath, expanded, recursive, this.props.content);
	}
	
	public render(): React.ReactNode {
		const { content,protoMode } = this.props;
		//console.log(content);
		return (
			<TabList className="tabsView" activeKey={this.props.viewType} onChange={this.props.onSetView}>
				<TabPanel id="tree" title="Tree" >
					<div className="TreeContent">
						<div className="path">
							{this.renderPath()}
						</div>
				
						{(content === undefined || content === null) ?
							<div className="message">Content is missing. Please make sure that your selected descriptor and your pinned property exists</div>
							:
							<JSONTree
								expandClicked={this.expandClicked}
								labelRenderer={this.labelRenderer}
								shouldExpandNode={shouldExpandNode(this.props.expandedKeys)}
								data={content}
								getItemString={this.getItemString} // shows object content shortcut
								hideRoot={true}
								sortObjectKeys={true}
								protoMode={protoMode}
							/>
						}
					</div>
				</TabPanel>
				<TabPanel id="raw" title="Raw" >
					<textarea
						maxLength={Number.MAX_SAFE_INTEGER}
						className="rawCode"
						defaultValue={this.props.descriptorContent}
					/>
				</TabPanel>
			</TabList>

		);
	}
}