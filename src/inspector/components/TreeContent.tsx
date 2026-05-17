import {useAppDispatch, useAppSelector} from "../../shared/store";
import {setInspectorPathContentAction, setExpandedPathAction, setInspectorViewAction, setAutoExpandLevelAction, setSearchContentKeywordAction} from "../actions/inspectorActions";
import {getTreeContent, getContentPath, getContentExpandedNodes, getActiveDescriptorContent, getContentActiveView, getContentExpandLevel, getSearchContentKeyword} from "../selectors/inspectorContentSelectors";
import React, {Component, Key, useCallback, useDeferredValue, useMemo} from "react";
import "./TreeContent.less";
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

	// Defer the (potentially huge) tree so typing into the filter stays responsive:
	// React keeps the old tree visible until the new one is ready.
	const deferredContent = useDeferredValue(content);

	const onInspectPath = useCallback(
		(p: KeyPath, mode: "replace" | "add") => dispatch(setInspectorPathContentAction(p, mode)),
		[dispatch],
	);
	const onSetExpandedPath = useCallback(
		(p: KeyPath, expand: boolean, recursive: boolean, data: any) =>
			dispatch(setExpandedPathAction("content", p, expand, recursive, data)),
		[dispatch],
	);
	const onSetView = useCallback(
		(vt: TGenericViewType) => dispatch(setInspectorViewAction("content", vt)),
		[dispatch],
	);
	const onSetAutoExpandLevel = useCallback(
		(level: number) => dispatch(setAutoExpandLevelAction("content", level)),
		[dispatch],
	);
	const onSetSearch = useCallback(
		(keyword: string) => dispatch(setSearchContentKeywordAction(keyword)),
		[dispatch],
	);

	const labelRendererFn = useCallback<TLabelRenderer>(
		([key, ...rest], nodeType, expanded, expandable) =>
			labelRenderer([key, ...rest], onInspectPath, nodeType, expanded, expandable),
		[onInspectPath],
	);

	const getItemStringFn = useCallback(
		(type: any, data: any): JSX.Element => getItemString(type, data, true, false),
		[],
	);

	const expandClicked = useCallback(
		(keyPath: KeyPath, expanded: boolean, recursive: boolean) =>
			onSetExpandedPath(keyPath, expanded, recursive, deferredContent),
		[onSetExpandedPath, deferredContent],
	);

	// Memoize the closure produced by the shouldExpandNode factory so JSONTree
	// doesn't see a new reference on every parent re-render.
	const shouldExpandNodeFn = useMemo(
		() => shouldExpandNode(expandedKeys, autoExpandLevels, true),
		[expandedKeys, autoExpandLevels],
	);

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
						{(deferredContent === undefined || deferredContent === null) ?
							<div className="message">Content is missing. Please make sure that your selected descriptor and your pinned property exists</div>
							:
							<JSONTree
								expandClicked={expandClicked}
								labelRenderer={labelRendererFn}
								shouldExpandNode={shouldExpandNodeFn}
								data={deferredContent}
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
