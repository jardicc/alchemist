import { connect, MapDispatchToPropsFunction } from "react-redux";
import { getLeftTreeDiff, getRightTreeDiff, getDiffPath } from "../../selectors/inspectorSelectors";
import { IRootState } from "../../../shared/store";
import { setInspectorPathDiffAction } from "../../actions/inspectorActions";
import TreeDiff, { ITreeDiffDispatch, ITreeDiffProps } from "./TreeDiff";


const mapStateToProps = (state: IRootState): ITreeDiffProps => {
	return {
		left: getLeftTreeDiff(state),
		right: getRightTreeDiff(state),
		path: getDiffPath(state),
		invertTheme: false,
		isWideLayout: true
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeDiffDispatch, Record<string, unknown>> = (dispatch):ITreeDiffDispatch => {
	return {
		onInspectPath: (path,mode) => dispatch(setInspectorPathDiffAction(path,mode))
	};
};

export const TreeDiffContainer = connect<ITreeDiffProps, ITreeDiffDispatch>(mapStateToProps, mapDispatchToProps)(TreeDiff);