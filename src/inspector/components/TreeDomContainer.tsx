import {connect, MapDispatchToPropsFunction} from "react-redux";
import {IRootState} from "../../shared/store";
import {setInspectorPathDomAction, setExpandedPathAction, setAutoExpandLevelAction} from "../actions/inspectorActions";
import {getTreeDomInstance, getDomPath, getDomExpandedNodes, getDOMExpandLevel} from "../selectors/inspectorDOMSelectors";

import React, {Component} from "react";
import "./TreeDomContainer.less";
import {getItemString} from "./TreeDiff/getItemString";
import {JSONTree} from "./react-json-tree-2";
import {TProtoMode} from "../model/types";
import {labelRenderer, shouldExpandNode} from "./sharedTreeView";
import {cloneDeep} from "lodash";
import {TreePath} from "./TreePath";
import {KeyPath, TExpandClicked, TLabelRenderer} from "./react-json-tree-2/types";

export const TreeDom: React.FC<TTreeDom> = (props) => {
	const labelRendererFn: TLabelRenderer = ([key, ...rest], nodeType, expanded, expandable) => {
		return labelRenderer([key, ...rest], props.onInspectPath, nodeType, expanded, expandable);
	};

	const getItemStringFn = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	};

	const expandClicked: TExpandClicked = (keyPath, expanded, recursive) => {
		props.onSetExpandedPath(keyPath, expanded, recursive, props.content);
	};

	const {content, protoMode, onInspectPath, autoExpandLevels, onSetAutoExpandLevel} = props;
	if (!content) {
		return <>{"Nothing to see there"}</>;
	}

	//let data:any = GetInfo.getDom(content.ref);
	let data: any = props.content;

	const path = cloneDeep(props.path);

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
						shouldExpandNode={shouldExpandNode(props.expandedKeys, autoExpandLevels)}
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


type TTreeDom = ITreeDomProps & ITreeDomDispatch

interface ITreeDomProps {
	path: KeyPath
	content: any
	expandedKeys: KeyPath[]
	protoMode: TProtoMode
	autoExpandLevels: number
}

const mapStateToProps = (state: IRootState): ITreeDomProps => ({
	content: getTreeDomInstance(state),
	path: getDomPath(state),
	protoMode: "uxp",
	expandedKeys: getDomExpandedNodes(state),
	autoExpandLevels: getDOMExpandLevel(state),
});

interface ITreeDomDispatch {
	onInspectPath: (path: KeyPath, mode: "replace" | "add") => void;
	onSetExpandedPath: (path: KeyPath, expand: boolean, recursive: boolean, data: any) => void;
	onSetAutoExpandLevel: (level: number) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeDomDispatch, Record<string, unknown>> = (dispatch): ITreeDomDispatch => ({
	onInspectPath: (path, mode) => dispatch(setInspectorPathDomAction(path, mode)),
	onSetExpandedPath: (path, expand, recursive, data) => dispatch(setExpandedPathAction("dom", path, expand, recursive, data)),
	onSetAutoExpandLevel: (level) => dispatch(setAutoExpandLevelAction("DOM", level)),
});

export const TreeDomContainer = connect<ITreeDomProps, ITreeDomDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(TreeDom);

