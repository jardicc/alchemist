import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import {  setInspectorPathDomAction, setExpandedPathAction, setAutoExpandLevelAction } from "../../actions/inspectorActions";
import { getTreeDomInstance, getDomPath, getDomExpandedNodes, getDOMExpandLevel } from "../../selectors/inspectorDOMSelectors";

import React, { Component } from "react";
import "./TreeDom.less";
import { getItemString } from "../TreeDiff/getItemString";
import {JSONTree} from "./../JSONTree";
import { TProtoMode, TPath } from "../../model/types";
import { renderPath, labelRenderer, shouldExpandNode } from "../shared/sharedTreeView";
import { TReference, GetInfo } from "../../classes/GetInfo";
import { cloneDeep } from "lodash";
import { TreePath } from "../TreePath/TreePath";

export interface ITreeDomProps{
	/*content: {
		ref: TReference[]|null
		path: string[]
	}*/
	path:TPath
	content: any
	expandedKeys: TPath[]
	protoMode: TProtoMode
	autoExpandLevels:number
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreeDomDispatch {
	onInspectPath: (path: string[], mode: "replace" | "add") => void;
	onSetExpandedPath: (path: TPath, expand: boolean, recursive: boolean, data: any) => void;
	onSetAutoExpandLevel:(level:number)=>void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeDomState{
	
}

export type TTreeDom = ITreeDomProps & ITreeDomDispatch

export class TreeDom extends Component<TTreeDom, ITreeDomState> {

	constructor(props: TTreeDom) {
		super(props);

		this.state = {
		};
	}
	
	private labelRenderer = ([key, ...rest]: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
		return labelRenderer([key, ...rest], this.props.onInspectPath, nodeType, expanded, expandable);
	}

	public getItemString = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	}

	private expandClicked = (keyPath: TPath, expanded: boolean, recursive:boolean) => {
		this.props.onSetExpandedPath(keyPath, expanded, recursive, this.props.content);
	}
	
	public render(): React.ReactNode {
		const { content, protoMode, onInspectPath,autoExpandLevels,onSetAutoExpandLevel } = this.props;
		if (!content) {
			return "Nothing to see there";
		}
		
		//let data:any = GetInfo.getDom(content.ref);
		let data: any = this.props.content;
		
		const path = cloneDeep(this.props.path);
		
		/*for (const part of path) {
			data = (data)?.[part];
		}*/

		// make primitive types pin-able
		if (typeof data !== "object" && data !== undefined && data !== null) {
			const lastPart = path[path.length - 1];
			data = { ["$$$noPin_"+lastPart]:data };
		}
		//console.log(content);
		return (
			<div className="TreeDom">
				<TreePath
					autoExpandLevels = {autoExpandLevels}
					onInspectPath = {onInspectPath}
					onSetAutoExpandLevel = {onSetAutoExpandLevel}
					path = {path}
				/>
				<div className="TreeDomBox">
					{(content === undefined || content === null) ?
						<div className="message">Content is missing. Please make sure that your selected descriptor and your pinned property exists</div>
						:
						<JSONTree
							shouldExpandNode={shouldExpandNode(this.props.expandedKeys,autoExpandLevels)}
							expandClicked={this.expandClicked}
							data={data}
							keyPath={path}
							protoMode={protoMode}
							labelRenderer={this.labelRenderer}
							getItemString={this.getItemString} // shows object content shortcut
							hideRoot={true}
							sortObjectKeys={true}
						/>
					}
				</div>
			</div>
		);
	}
}



const mapStateToProps = (state: IRootState): ITreeDomProps => {
	const props:ITreeDomProps = {
		//content: getTreeDom(state),		
		content: getTreeDomInstance(state),		
		path: getDomPath(state),
		protoMode: "uxp",
		expandedKeys: getDomExpandedNodes(state),
		autoExpandLevels: getDOMExpandLevel(state)
	};
	return props;
};

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeDomDispatch, Record<string, unknown>> = (dispatch):ITreeDomDispatch => {
	return {
		onInspectPath: (path, mode) => dispatch(setInspectorPathDomAction(path, mode)),
		onSetExpandedPath: (path, expand, recursive, data) => dispatch(setExpandedPathAction("dom", path, expand, recursive, data)),
		onSetAutoExpandLevel: (level) => dispatch(setAutoExpandLevelAction("DOM", level))
	};
};

export const TreeDomContainer = connect<ITreeDomProps, ITreeDomDispatch>(mapStateToProps, mapDispatchToProps)(TreeDom);

