import { connect, MapDispatchToPropsFunction } from "react-redux";
import { ITreeContentDispatch, ITreeContentProps, TreeContent } from "./TreeContent";
import { IRootState } from "../../../shared/store";
import { setInspectorPathContentAction, setExpandedPathAction, setInspectorViewAction, setAutoExpandLevelAction } from "../../actions/inspectorActions";
import { getTreeContent, getContentPath, getContentExpandedNodes, getActiveDescriptorContent, getContentActiveView, getContentExpandLevel } from "../../selectors/inspectorContentSelectors";


const mapStateToProps = (state: IRootState): ITreeContentProps => {
	return {
		content: getTreeContent(state),		
		path: getContentPath(state),
		protoMode: "none",
		expandedKeys: getContentExpandedNodes(state),
		descriptorContent: getActiveDescriptorContent(state),
		viewType: getContentActiveView(state),
		autoExpandLevels: getContentExpandLevel(state)
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeContentDispatch, Record<string, unknown>> = (dispatch):ITreeContentDispatch => {
	return {
		onInspectPath: (path, mode) => dispatch(setInspectorPathContentAction(path, mode)),
		onSetExpandedPath: (path, expand, recursive, data) => dispatch(setExpandedPathAction("content", path, expand, recursive, data)),
		onSetView: (viewType) => dispatch(setInspectorViewAction("content", viewType)),
		onSetAutoExpandLevel: (level) => dispatch(setAutoExpandLevelAction("content", level))
	};
};

export const TreeContentContainer = connect<ITreeContentProps, ITreeContentDispatch>(mapStateToProps, mapDispatchToProps)(TreeContent);

