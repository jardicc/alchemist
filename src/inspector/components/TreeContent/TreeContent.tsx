import React, { Component } from "react";
import "./TreeContent.less";
import { getItemString } from "../TreeDiff/getItemString";
import JSONTree from "./../JSONTree";
import { TProtoMode, TPath, TGenericViewType } from "../../model/types";
import { labelRenderer, shouldExpandNode } from "../shared/sharedTreeView";
import { TLabelRenderer } from "../JSONTree/types";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import { TreePath } from "../TreePath/TreePath";

export interface ITreeContentProps{
	content: any
	path: string[]
	expandedKeys: TPath[]
	protoMode: TProtoMode
	descriptorContent: string
	viewType: TGenericViewType
	autoExpandLevels:number
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreeContentDispatch {
	onInspectPath: (path: string[], mode: "replace" | "add") => void;
	onSetExpandedPath: (path: TPath, expand: boolean, recursive: boolean, data: any) => void;
	onSetView: (viewType: TGenericViewType) => void
	onSetAutoExpandLevel:(level:number)=>void
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

	public getItemString = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	}

	private expandClicked = (keyPath: TPath, expanded: boolean, recursive:boolean) => {
		this.props.onSetExpandedPath(keyPath, expanded, recursive, this.props.content);
	}
	
	
	public render(): React.ReactNode {
		const { content, protoMode, autoExpandLevels, onInspectPath, onSetAutoExpandLevel, path, expandedKeys, viewType ,onSetView} = this.props;
		//console.log(content);
		return (
			<TabList className="tabsView" activeKey={viewType} onChange={onSetView}>
				<TabPanel id="tree" title="Tree" noPadding={true}>
					<div className="TreeContent">
						<TreePath
							autoExpandLevels = {autoExpandLevels}
							onInspectPath = {onInspectPath}
							onSetAutoExpandLevel = {onSetAutoExpandLevel}
							path={path}
							allowInfinityLevels={true}
						/>
						<div className="TreeContentBox">
							{(content === undefined || content === null) ?
								<div className="message">Content is missing. Please make sure that your selected descriptor and your pinned property exists</div>
								:
								<JSONTree
									expandClicked={this.expandClicked}
									labelRenderer={this.labelRenderer}
									shouldExpandNode={shouldExpandNode(expandedKeys,autoExpandLevels, true)}
									data={content}
									getItemString={this.getItemString} // shows object content shortcut
									hideRoot={true}
									sortObjectKeys={true}
									protoMode={protoMode}
								/>
							}
						</div>
					</div>
				</TabPanel>
				<TabPanel id="raw" title="Raw" >
					<div className="textareaWrap">
						<span className="placeholder">{this.props.descriptorContent.substr(0,2000)}</span>
						<textarea
							maxLength={Number.MAX_SAFE_INTEGER}
							className="rawCode"
							defaultValue={this.props.descriptorContent}
						/>
					</div>
				</TabPanel>
			</TabList>
		);
	}
}