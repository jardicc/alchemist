import { connect, MapDispatchToPropsFunction } from "react-redux";
import { ITreeContentDispatch, ITreeContentProps, TreeContent } from "./TreeContent";
import { getTreeContent, getContentPath } from "../../selectors/inspectorSelectors";
import { IRootState } from "../../../shared/store";
import { setInspectorPathContentAction } from "../../actions/inspectorActions";


const mapStateToProps = (state: IRootState): ITreeContentProps => {
	return {
		content: getTreeContent(state),
		path: getContentPath(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeContentDispatch, Record<string, unknown>> = (dispatch):ITreeContentDispatch => {
	return {
		onInspectPath: (path,mode) => dispatch(setInspectorPathContentAction(path,mode))
	};
};

export const TreeContentContainer = connect<ITreeContentProps, ITreeContentDispatch>(mapStateToProps, mapDispatchToProps)(TreeContent);