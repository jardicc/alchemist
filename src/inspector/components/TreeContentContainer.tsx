import {connect, MapDispatchToPropsFunction} from "react-redux";
import {IRootState} from "../../shared/store";
import {setInspectorPathContentAction, setExpandedPathAction, setInspectorViewAction, setAutoExpandLevelAction, setSearchContentKeywordAction} from "../actions/inspectorActions";
import {getTreeContent, getContentPath, getContentExpandedNodes, getActiveDescriptorContent, getContentActiveView, getContentExpandLevel, getSearchContentKeyword} from "../selectors/inspectorContentSelectors";
import React, {Component, Key} from "react";
import "./TreeContentContainer.less";
import {getItemString} from "./TreeDiff/getItemString";
import {JSONTree} from "./react-json-tree-2";
import {TProtoMode, TGenericViewType} from "../model/types";
import {labelRenderer, shouldExpandNode} from "./sharedTreeView";
import {TabList} from "./Tabs/TabList";
import {TabPanel} from "./Tabs/TabListPanel";
import {TreePath} from "./TreePath";
import SP from "react-uxp-spectrum";
import {KeyPath, TLabelRenderer} from "./react-json-tree-2/types";


export const TreeContent: React.FC<TTreeContent> = (props) => {
	const labelRendererFn: TLabelRenderer = ([key, ...rest], nodeType, expanded, expandable): JSX.Element => {
		return labelRenderer([key, ...rest], props.onInspectPath, nodeType, expanded, expandable);
	};

	const getItemStringFn = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	};

	const expandClicked = (keyPath: KeyPath, expanded: boolean, recursive: boolean) => {
		props.onSetExpandedPath(keyPath, expanded, recursive, props.content);
	};

	const renderSearchField = () => {
		return (
			<SP.Textfield
				className="filterContent"
				type="search"
				placeholder="Filter..."
				value={props.search}
				onInput={(e) => { props.onSetSearch(e.target?.value ?? ""); }}
			/>
		);
	};

	const {content, protoMode, autoExpandLevels, onInspectPath, onSetAutoExpandLevel, path, expandedKeys, viewType, onSetView} = props;
	//console.log(content);
	return (
		<TabList className="tabsView" activeKey={viewType} onChange={onSetView} postFix={renderSearchField()} >
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
									expandClicked={expandClicked}
									labelRenderer={labelRendererFn}
									shouldExpandNode={shouldExpandNode(expandedKeys, autoExpandLevels, true)}
									data={content}
									getItemString={getItemStringFn} // shows object content shortcut
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
					<TreePath
						autoExpandLevels={autoExpandLevels}
						onInspectPath={onInspectPath}
						onSetAutoExpandLevel={onSetAutoExpandLevel}
						path={path}
						allowInfinityLevels={false}
						hideLevels={true}
					/>
					<SP.Textarea
						className="rawCode"
						value={content ? JSON.stringify(content, null, 2).replaceAll("$$$noPin_", "") : ""}
					/>
				</div>
			</TabPanel>
		</TabList>
	);
};

type TTreeContent = ITreeContentProps & ITreeContentDispatch

interface ITreeContentProps {
	content: any
	path: KeyPath
	expandedKeys: KeyPath[]
	protoMode: TProtoMode
	descriptorContent: string
	viewType: TGenericViewType
	autoExpandLevels: number
	search: string
}

const mapStateToProps = (state: IRootState): ITreeContentProps => ({
	content: getTreeContent(state),
	path: getContentPath(state),
	search: getSearchContentKeyword(state),
	protoMode: "none",
	expandedKeys: getContentExpandedNodes(state),
	descriptorContent: getActiveDescriptorContent(state),
	viewType: getContentActiveView(state),
	autoExpandLevels: getContentExpandLevel(state),
});

interface ITreeContentDispatch {
	onInspectPath: (path: KeyPath, mode: "replace" | "add") => void;
	onSetExpandedPath: (path: KeyPath, expand: boolean, recursive: boolean, data: any) => void;
	onSetView: (viewType: TGenericViewType) => void
	onSetAutoExpandLevel: (level: number) => void
	onSetSearch: (keyword: string) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeContentDispatch, Record<string, unknown>> = (dispatch): ITreeContentDispatch => ({
	onInspectPath: (path, mode) => dispatch(setInspectorPathContentAction(path, mode)),
	onSetExpandedPath: (path, expand, recursive, data) => dispatch(setExpandedPathAction("content", path, expand, recursive, data)),
	onSetView: (viewType) => dispatch(setInspectorViewAction("content", viewType)),
	onSetAutoExpandLevel: (level) => dispatch(setAutoExpandLevelAction("content", level)),
	onSetSearch: (keyword) => dispatch(setSearchContentKeywordAction(keyword)),
});

export const TreeContentContainer = connect(mapStateToProps, mapDispatchToProps)(TreeContent);

