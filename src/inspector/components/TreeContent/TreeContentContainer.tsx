import { connect, MapDispatchToPropsFunction } from "react-redux";
import { ITreeContentDispatch, ITreeContentProps, TreeContent } from "./TreeContent";
import { getTreeContent, getContentPath, getContentExpandedNodes } from "../../selectors/inspectorSelectors";
import { IRootState } from "../../../shared/store";
import { setInspectorPathContentAction, setExpandedPathAction } from "../../actions/inspectorActions";


const mapStateToProps = (state: IRootState): ITreeContentProps => {
	return {
		content: getTreeContent(state),		
		path: getContentPath(state),
		protoMode: "none",
		expandedKeys: getContentExpandedNodes(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeContentDispatch, Record<string, unknown>> = (dispatch):ITreeContentDispatch => {
	return {
		onInspectPath: (path, mode) => dispatch(setInspectorPathContentAction(path, mode)),
		onSetExpandedPath: (path, expand, recursive,data) => dispatch(setExpandedPathAction("content",path, expand, recursive,data)),
	};
};

export const TreeContentContainer = connect<ITreeContentProps, ITreeContentDispatch>(mapStateToProps, mapDispatchToProps)(TreeContent);

