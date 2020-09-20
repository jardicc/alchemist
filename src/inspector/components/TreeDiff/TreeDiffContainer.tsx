import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import { setInspectorPathDiffAction, setExpandedPathAction, setInspectorViewAction } from "../../actions/inspectorActions";
import { getLeftTreeDiff, getRightTreeDiff, getDiffPath, getDiffExpandedNodes, getLeftRawDiff, getRightRawDiff, getDiffActiveView } from "../../selectors/inspectorDiffSelectors";
import TreeDiff, { ITreeDiffDispatch, ITreeDiffProps } from "./TreeDiff";


const mapStateToProps = (state: IRootState): ITreeDiffProps => {
	return {
		left: getLeftTreeDiff(state),
		right: getRightTreeDiff(state),
		path: getDiffPath(state),
		invertTheme: false,
		isWideLayout: true,
		expandedKeys: getDiffExpandedNodes(state),
		rightRawDiff: getRightRawDiff(state),
		leftRawDiff: getLeftRawDiff(state),
		viewType:getDiffActiveView(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeDiffDispatch, Record<string, unknown>> = (dispatch):ITreeDiffDispatch => {
	return {
		onInspectPath: (path, mode) => dispatch(setInspectorPathDiffAction(path, mode)),
		onSetExpandedPath: (path, expand, recursive,data) => dispatch(setExpandedPathAction("difference",path, expand, recursive,data)),
		onSetView:(viewType) => dispatch(setInspectorViewAction("diff",viewType))
	};
};

export const TreeDiffContainer = connect<ITreeDiffProps, ITreeDiffDispatch>(mapStateToProps, mapDispatchToProps)(TreeDiff);