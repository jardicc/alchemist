import { connect, MapDispatchToPropsFunction } from "react-redux";
import { ITreeDomDispatch, ITreeDomProps, TreeDom } from "./TreeDom";
import { getTreeDom, getContentPath, getDomExpandedNodes, getTreeDomInstance, getDomPath } from "../../selectors/inspectorSelectors";
import { IRootState } from "../../../shared/store";
import {  setInspectorPathDomAction, setExpandedPathAction } from "../../actions/inspectorActions";


const mapStateToProps = (state: IRootState): ITreeDomProps => {
	const props:ITreeDomProps = {
		//content: getTreeDom(state),		
		content: getTreeDomInstance(state),		
		path: getDomPath(state),
		protoMode: "uxp",
		expandedKeys: getDomExpandedNodes(state),
	};
	return props;
};

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeDomDispatch, Record<string, unknown>> = (dispatch):ITreeDomDispatch => {
	return {
		onInspectPath: (path, mode) => dispatch(setInspectorPathDomAction(path, mode)),
		onSetExpandedPath: (path, expand, recursive,data) => dispatch(setExpandedPathAction("dom",path, expand, recursive,data)),
	};
};

export const TreeDomContainer = connect<ITreeDomProps, ITreeDomDispatch>(mapStateToProps, mapDispatchToProps)(TreeDom);

