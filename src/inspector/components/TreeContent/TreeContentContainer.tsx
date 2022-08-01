import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import { setInspectorPathContentAction, setExpandedPathAction, setInspectorViewAction, setAutoExpandLevelAction } from "../../actions/inspectorActions";
import { getTreeContent, getContentPath, getContentExpandedNodes, getActiveDescriptorContent, getContentActiveView, getContentExpandLevel } from "../../selectors/inspectorContentSelectors";
import React, { Component } from "react";
import "./TreeContent.less";
import { getItemString } from "../TreeDiff/getItemString";
import {JSONTree} from "./../JSONTree";
import { TProtoMode, TPath, TGenericViewType } from "../../model/types";
import { labelRenderer, shouldExpandNode } from "../shared/sharedTreeView";
import { TLabelRenderer } from "../JSONTree/types";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import { TreePath } from "../TreePath/TreePath";
import SP from "react-uxp-spectrum";

class TreeContent extends Component<TTreeContent, Record<string, unknown>> {

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
							autoExpandLevels={autoExpandLevels}
							onInspectPath={onInspectPath}
							onSetAutoExpandLevel={onSetAutoExpandLevel}
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
									shouldExpandNode={shouldExpandNode(expandedKeys, autoExpandLevels, true)}
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
						<SP.Textarea
							className="rawCode"
							value={this.props.descriptorContent}
						/>
					</div>
				</TabPanel>
			</TabList>
		);
	}
}

type TTreeContent = ITreeContentProps & ITreeContentDispatch

interface ITreeContentProps{
	content: any
	path: string[]
	expandedKeys: TPath[]
	protoMode: TProtoMode
	descriptorContent: string
	viewType: TGenericViewType
	autoExpandLevels:number
}

const mapStateToProps = (state: IRootState): ITreeContentProps => ({
	content: getTreeContent(state),		
	path: getContentPath(state),
	protoMode: "none",
	expandedKeys: getContentExpandedNodes(state),
	descriptorContent: getActiveDescriptorContent(state),
	viewType: getContentActiveView(state),
	autoExpandLevels: getContentExpandLevel(state),
});

interface ITreeContentDispatch {
	onInspectPath: (path: string[], mode: "replace" | "add") => void;
	onSetExpandedPath: (path: TPath, expand: boolean, recursive: boolean, data: any) => void;
	onSetView: (viewType: TGenericViewType) => void
	onSetAutoExpandLevel:(level:number)=>void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeContentDispatch, Record<string, unknown>> = (dispatch):ITreeContentDispatch => ({
	onInspectPath: (path, mode) => dispatch(setInspectorPathContentAction(path, mode)),
	onSetExpandedPath: (path, expand, recursive, data) => dispatch(setExpandedPathAction("content", path, expand, recursive, data)),
	onSetView: (viewType) => dispatch(setInspectorViewAction("content", viewType)),
	onSetAutoExpandLevel: (level) => dispatch(setAutoExpandLevelAction("content", level)),
});

export const TreeContentContainer = connect(mapStateToProps, mapDispatchToProps)(TreeContent);

