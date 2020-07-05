import { connect, MapDispatchToPropsFunction } from "react-redux";
import { getFilterType, getInclude, getExclude, getSearchEvent } from "../selectors";
import { setSearchTermAction, setFilterTypeAction, setIncludeAction, setExcludeAction } from "../actions/actions";
import { IFilterProps, IFilterDispatch } from "./Filter";
import {Filter} from "./Filter";
import { IRootState } from "../../store";


const mapStateToProps = (state: IRootState): IFilterProps => {
	return {
		filterType: getFilterType(state),
		include: getInclude(state),
		exclude: getExclude(state),
		searchEvent: getSearchEvent(state)
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IFilterDispatch, Record<string, unknown>> = (dispatch): IFilterDispatch => {
	return {
		setSearchTerm: (str) => dispatch(setSearchTermAction(str)),
		setFilterEventsType: (type) => dispatch(setFilterTypeAction(type)),
		setInclude: (arr) => dispatch(setIncludeAction(arr)),
		setExclude: (arr) => dispatch(setExcludeAction(arr)),
	};
};

export const FilterContainer = connect<IFilterProps, IFilterDispatch>(mapStateToProps, mapDispatchToProps)(Filter);