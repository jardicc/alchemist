import { IRootState } from "../../../shared/store";
import { MapDispatchToPropsFunction, connect } from "react-redux";
import { IListenerFilterProps, IListenerFilterDispatch, ListenerFilter } from "./ListenerFilter";
import { getInspectorSettings, getSelectedTargetReference, getActiveTargetReferenceListenerCategory } from "../../selectors/inspectorSelectors";
import { setExcludeAction, setFilterTypeAction, setIncludeAction, setFilterStateAction } from "../../actions/inspectorActions";
import { IContentWrapper, TListenerCategoryReference } from "../../model/types";



const mapStateToProps = (state: IRootState): IListenerFilterProps => {
	return {
		settings: getInspectorSettings(state),
		selectedTargetReference: getSelectedTargetReference(state),		
		activeTargetReferenceListenerCategory: getActiveTargetReferenceListenerCategory(state) as IContentWrapper<TListenerCategoryReference>,
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IListenerFilterDispatch, Record<string, unknown>> = (dispatch):IListenerFilterDispatch => {
	return {
		setExclude: (arr) => dispatch(setExcludeAction(arr)),
		setFilterEventsType: (type) => dispatch(setFilterTypeAction(type)),
		setInclude: (arr) => dispatch(setIncludeAction(arr)),
		onSetFilter: (type, subType, state) => dispatch(setFilterStateAction(type, subType, state)),
	};
};

export const ListenerFilterContainer = connect<IListenerFilterProps, IListenerFilterDispatch>(mapStateToProps, mapDispatchToProps)(ListenerFilter);