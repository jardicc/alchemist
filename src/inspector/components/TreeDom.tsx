import {useAppDispatch, useAppSelector} from "../../shared/store";
import {inspectorSlice} from "../inspectorSlice";
import {getTreeDomInstance, getDomPath, getDomExpandedNodes, getDOMExpandLevel} from "../selectors/inspectorDOMSelectors";

import React, {useCallback, useMemo} from "react";
import "./TreeDom.less";
import {getItemString} from "./TreeDiff/getItemString";
import {JSONTree} from "./react-json-tree-2";
import {TProtoMode} from "../model/types";
import {labelRenderer, shouldExpandNode} from "./sharedTreeView";
import {cloneDeep} from "lodash";
import {TreePath} from "./TreePath";
import {KeyPath, TExpandClicked, TLabelRenderer} from "./react-json-tree-2/types";

const {setInspectorPathDom, setExpandedPath, setAutoExpandLevel} = inspectorSlice.actions;

export const TreeDom: React.FC = () => {
	const dispatch = useAppDispatch();
	const content = useAppSelector(getTreeDomInstance);
	const rawPath = useAppSelector(getDomPath);
	const expandedKeys = useAppSelector(getDomExpandedNodes);
	const autoExpandLevels = useAppSelector(getDOMExpandLevel);
	const protoMode: TProtoMode = "uxp";

	const onInspectPath = useCallback(
		(p: KeyPath, mode: "replace" | "add") => dispatch(setInspectorPathDom(p, mode)),
		[dispatch],
	);
	const onSetExpandedPath = useCallback(
		(p: KeyPath, expand: boolean, recursive: boolean, data: any) =>
				dispatch(setExpandedPath("dom", p, expand, recursive, data)),
		[dispatch],
	);
	const onSetAutoExpandLevel = useCallback(
		(level: number) => dispatch(setAutoExpandLevel("DOM", level)),
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

	const expandClicked = useCallback<TExpandClicked>(
		(keyPath, expanded, recursive) => onSetExpandedPath(keyPath, expanded, recursive, content),
		[onSetExpandedPath, content],
	);

	const shouldExpandNodeFn = useMemo(
		() => shouldExpandNode(expandedKeys, autoExpandLevels),
		[expandedKeys, autoExpandLevels],
	);

	if (!content) {
		return <>{"Nothing to see there"}</>;
	}

	//let data:any = GetInfo.getDom(content.ref);
	let data: any = content;

	const path = cloneDeep(rawPath);

	/*for (const part of path) {
		data = (data)?.[part];
	}*/

	// make primitive types pin-able
	if (typeof data !== "object" && data !== undefined && data !== null) {
		const lastPart = path[path.length - 1];
		data = {["$$$noPin_" + lastPart]: data};
	}
	//console.log(content);
	return (
		<div className="TreeDom">
			<TreePath
				allowInfinityLevels={false}
				maxLevels={3}
				autoExpandLevels={autoExpandLevels}
				onInspectPath={onInspectPath}
				onSetAutoExpandLevel={onSetAutoExpandLevel}
				path={path}
			/>
			<div className="TreeDomBox">
				{(content === undefined || content === null) ?
					<div className="message">Content is missing. Please make sure that your selected descriptor and your pinned property exists</div>
					:
					<JSONTree
						shouldExpandNode={shouldExpandNodeFn}
						expandClicked={expandClicked}
						data={data}
						keyPath={path}
						protoMode={protoMode}
						labelRenderer={labelRendererFn}
						getItemString={getItemStringFn} // shows object content shortcut
						hideRoot={true}
						sortObjectKeys={true}
					/>
				}
			</div>
		</div>
	);
};
