import { connect } from 'react-redux'
import { IAppState, IAction } from '../reducers/initialState'
import { getCollapsedDefault, getBatchPlayDecorator, getFilterType, getInclude, getExclude } from '../selectors'
import { toggleCollapseOptionAction, addReplyAction, toggleExpandAction, setSearchTermAction, setFilterTypeAction, setIncludeAction, setExcludeAction } from '../actions/actions'
import { IFilterProps, IFilterDispatch } from './Filter'
import cloneDeep from "lodash/cloneDeep"
import Filter from './Filter'


const mapStateToProps = (state: IAppState): IFilterProps => {
	return {
		filterType: getFilterType(state),
		include: getInclude(state),
		exclude: getExclude(state)
	}
}

const mapDispatchToProps = (dispatch: any):IFilterDispatch => {
	return {
		setSearchTerm: (str) => dispatch(setSearchTermAction(str)),
		setFilterEventsType: (type) => dispatch(setFilterTypeAction(type)),
		setInclude:(arr)=>dispatch(setIncludeAction(arr)),
		setExclude:(arr)=>dispatch(setExcludeAction(arr)),
	}
}

export default connect<IFilterProps, IFilterDispatch>(mapStateToProps, mapDispatchToProps)(Filter)