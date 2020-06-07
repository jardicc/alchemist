import { connect } from 'react-redux'
import { IAppState, IAction, IActionView } from '../reducers/initialState'
import { getCollapsedDefault, getBatchPlayDecorator, getGroupSame, getExclude, getInclude, getIncludeArr, getExcludeArr } from '../selectors'
import { toggleCollapseOptionAction, addReplyAction, toggleExpandAction, removeActionAction, filterEventNameAction } from '../actions/actions'
import { IActionItemProps, IActionItemDispatch } from './ActionItem'
import cloneDeep from "lodash/cloneDeep"
import ActionItem from './ActionItem'

interface IOwn{
	action:IActionView
}

const mapStateToProps = (state: IAppState, ownProps: IOwn): IActionItemProps => {
	
	return {
		action: cloneDeep(ownProps.action),
		batchPlayDecorator: getBatchPlayDecorator(state),
		groupSame: getGroupSame(state),
		exclude: getExcludeArr(state),
		include: getIncludeArr(state),
	};
}

const mapDispatchToProps = (dispatch: any):IActionItemDispatch => {
	return {
		addReply: (reply,id) => dispatch(addReplyAction(reply,id)),
		toggleExpand: (expand, id) => dispatch(toggleExpandAction(expand, id)),
		removeAction: (id) => dispatch(removeActionAction(id)),
		filterEventName:(eventName,kind,operation)=>dispatch(filterEventNameAction(eventName,kind,operation))
	}
}

export default connect<IActionItemProps, IActionItemDispatch, IOwn>(mapStateToProps, mapDispatchToProps)(ActionItem)