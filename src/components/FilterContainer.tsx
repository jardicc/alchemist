import { connect } from 'react-redux'
import { IAppState, IAction } from '../reducers/initialState'
import { getCollapsedDefault, getBatchPlayDecorator } from '../selectors'
import { toggleCollapseOptionAction, addReplyAction, toggleExpandAction, setSearchTermAction } from '../actions/actions'
import { IFilterProps, IFilterDispatch } from './Filter'
import cloneDeep from "lodash/cloneDeep"
import Filter from './Filter'


const mapStateToProps = (state: IAppState): IFilterProps => {
	return {

	}
}

const mapDispatchToProps = (dispatch: any):IFilterDispatch => {
	return {
		setSearchTerm: (str) => dispatch(setSearchTermAction(str)),
		setFilterEventsType:(type)=>dispatch()
	}
}

export default connect<IFilterProps, IFilterDispatch>(mapStateToProps, mapDispatchToProps)(Filter)