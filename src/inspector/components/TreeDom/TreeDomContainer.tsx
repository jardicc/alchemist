import { connect, MapDispatchToPropsFunction } from "react-redux";
import { ITreeDomDispatch, ITreeDomProps, TreeDom } from "./TreeDom";
import { IRootState } from "../../../shared/store";
import {  setInspectorPathDomAction, setExpandedPathAction, setAutoExpandLevelAction } from "../../actions/inspectorActions";
import { getTreeDomInstance, getDomPath, getDomExpandedNodes, getDOMExpandLevel } from "../../selectors/inspectorDOMSelectors";


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

