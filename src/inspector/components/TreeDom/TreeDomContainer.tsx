import {connect, MapDispatchToPropsFunction} from "react-redux";
import {IRootState} from "../../../shared/store";
import {setInspectorPathDomAction, setExpandedPathAction, setAutoExpandLevelAction} from "../../actions/inspectorActions";
import {getTreeDomInstance, getDomPath, getDomExpandedNodes, getDOMExpandLevel} from "../../selectors/inspectorDOMSelectors";

import React, {Component} from "react";
import "./TreeDom.less";
import {getItemString} from "../TreeDiff/getItemString";
import {JSONTree} from "./../JSONTree";
import {TProtoMode, TPath} from "../../model/types";
import {labelRenderer, shouldExpandNode} from "../shared/sharedTreeView";
import {cloneDeep} from "lodash";
import {TreePath} from "../TreePath/TreePath";

export class TreeDom extends Component<TTreeDom, Record<string, unknown>> {

	constructor(props: TTreeDom) {
		super(props);
	}

	private labelRenderer = ([key, ...rest]: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
		return labelRenderer([key, ...rest], this.props.onInspectPath, nodeType, expanded, expandable);
	};

	public getItemString = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	};

	private expandClicked = (keyPath: TPath, expanded: boolean, recursive: boolean) => {
		this.props.onSetExpandedPath(keyPath, expanded, recursive, this.props.content);
	};

	public render(): React.ReactNode {
		const {content, protoMode, onInspectPath, autoExpandLevels, onSetAutoExpandLevel} = this.props;
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
							shouldExpandNode={shouldExpandNode(this.props.expandedKeys, autoExpandLevels)}
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


type TTreeDom = ITreeDomProps & ITreeDomDispatch

interface ITreeDomProps {
	path: TPath
	content: any
	expandedKeys: TPath[]
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
	onInspectPath: (path: string[], mode: "replace" | "add") => void;
	onSetExpandedPath: (path: TPath, expand: boolean, recursive: boolean, data: any) => void;
	onSetAutoExpandLevel: (level: number) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeDomDispatch, Record<string, unknown>> = (dispatch): ITreeDomDispatch => ({
	onInspectPath: (path, mode) => dispatch(setInspectorPathDomAction(path, mode)),
	onSetExpandedPath: (path, expand, recursive, data) => dispatch(setExpandedPathAction("dom", path, expand, recursive, data)),
	onSetAutoExpandLevel: (level) => dispatch(setAutoExpandLevelAction("DOM", level)),
});

export const TreeDomContainer = connect<ITreeDomProps, ITreeDomDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(TreeDom);

