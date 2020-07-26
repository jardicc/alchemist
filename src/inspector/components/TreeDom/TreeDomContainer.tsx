import { connect, MapDispatchToPropsFunction } from "react-redux";
import { ITreeDomDispatch, ITreeDomProps, TreeDom } from "./TreeDom";
import { getTreeDom, getContentPath } from "../../selectors/inspectorSelectors";
import { IRootState } from "../../../shared/store";
import {  setInspectorPathDomAction } from "../../actions/inspectorActions";


const mapStateToProps = (state: IRootState): ITreeDomProps => {
	return {
		content: getTreeDom(state),		
		//path: getContentPath(state),
		protoMode: "uxp"
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ITreeDomDispatch, Record<string, unknown>> = (dispatch):ITreeDomDispatch => {
	return {
		onInspectPath: (path,mode) => dispatch(setInspectorPathDomAction(path,mode))
	};
};

export const TreeDomContainer = connect<ITreeDomProps, ITreeDomDispatch>(mapStateToProps, mapDispatchToProps)(TreeDom);

