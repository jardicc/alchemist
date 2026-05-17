import {useAppDispatch, useAppSelector} from "../../shared/store";
import {setInspectorPathDomAction, setExpandedPathAction, setAutoExpandLevelAction} from "../actions/inspectorActions";
import {getTreeDomInstance, getDomPath, getDomExpandedNodes, getDOMExpandLevel} from "../selectors/inspectorDOMSelectors";

import React from "react";
import "./TreeDom.less";
import {getItemString} from "./TreeDiff/getItemString";
import {JSONTree} from "./react-json-tree-2";
import {TProtoMode} from "../model/types";
import {labelRenderer, shouldExpandNode} from "./sharedTreeView";
import {cloneDeep} from "lodash";
import {TreePath} from "./TreePath";
import {KeyPath, TExpandClicked, TLabelRenderer} from "./react-json-tree-2/types";

export const TreeDom: React.FC = () => {
	const dispatch = useAppDispatch();
	const content = useAppSelector(getTreeDomInstance);
	const rawPath = useAppSelector(getDomPath);
	const expandedKeys = useAppSelector(getDomExpandedNodes);
	const autoExpandLevels = useAppSelector(getDOMExpandLevel);
	const protoMode: TProtoMode = "uxp";
	const onInspectPath = (p: KeyPath, mode: "replace" | "add") => dispatch(setInspectorPathDomAction(p, mode));
	const onSetExpandedPath = (p: KeyPath, expand: boolean, recursive: boolean, data: any) => dispatch(setExpandedPathAction("dom", p, expand, recursive, data));
	const onSetAutoExpandLevel = (level: number) => dispatch(setAutoExpandLevelAction("DOM", level));

	const labelRendererFn: TLabelRenderer = ([key, ...rest], nodeType, expanded, expandable) => {
		return labelRenderer([key, ...rest], onInspectPath, nodeType, expanded, expandable);
	};

	const getItemStringFn = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	};

	const expandClicked: TExpandClicked = (keyPath, expanded, recursive) => {
		onSetExpandedPath(keyPath, expanded, recursive, content);
	};

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
						shouldExpandNode={shouldExpandNode(expandedKeys, autoExpandLevels)}
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
