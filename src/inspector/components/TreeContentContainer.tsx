import {useAppDispatch, useAppSelector} from "../../shared/store";
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

export const TreeContent: React.FC = () => {
	const dispatch = useAppDispatch();
	const content = useAppSelector(getTreeContent);
	const path = useAppSelector(getContentPath);
	const expandedKeys = useAppSelector(getContentExpandedNodes);
	const viewType = useAppSelector(getContentActiveView);
	const autoExpandLevels = useAppSelector(getContentExpandLevel);
	const search = useAppSelector(getSearchContentKeyword);
	const protoMode: TProtoMode = "none";
	const onInspectPath = (p: KeyPath, mode: "replace" | "add") => dispatch(setInspectorPathContentAction(p, mode));
	const onSetExpandedPath = (p: KeyPath, expand: boolean, recursive: boolean, data: any) => dispatch(setExpandedPathAction("content", p, expand, recursive, data));
	const onSetView = (vt: TGenericViewType) => dispatch(setInspectorViewAction("content", vt));
	const onSetAutoExpandLevel = (level: number) => dispatch(setAutoExpandLevelAction("content", level));
	const onSetSearch = (keyword: string) => dispatch(setSearchContentKeywordAction(keyword));
	const labelRendererFn: TLabelRenderer = ([key, ...rest], nodeType, expanded, expandable): JSX.Element => {
		return labelRenderer([key, ...rest], onInspectPath, nodeType, expanded, expandable);
	};

	const getItemStringFn = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	};

	const expandClicked = (keyPath: KeyPath, expanded: boolean, recursive: boolean) => {
		onSetExpandedPath(keyPath, expanded, recursive, content);
	};

	const renderSearchField = () => {
		return (
			<SP.Textfield
				className="filterContent"
				type="search"
				placeholder="Filter..."
				value={search}
				onInput={(e) => { onSetSearch(e.target?.value ?? ""); }}
			/>
		);
	};

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
