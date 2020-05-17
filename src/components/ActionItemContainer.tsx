import { connect } from 'react-redux'
import { IAppState, IAction } from '../reducers/initialState'
import { getCollapsedDefault, getBatchPlayDecorator } from '../selectors'
import { toggleCollapseOptionAction, addReplyAction, toggleExpandAction } from '../actions/actions'
import { IActionItemProps, IActionItemDispatch } from './ActionItem'
import cloneDeep from "lodash/cloneDeep"
import ActionItem from './ActionItem'

interface IOwn{
	action:IAction
}

const mapStateToProps = (state: IAppState, ownProps: IOwn): IActionItemProps => {
	
	return {
		action: cloneDeep(ownProps.action),
		batchPlayDecorator: getBatchPlayDecorator(state)
	};
}

const mapDispatchToProps = (dispatch: any):IActionItemDispatch => {
	return {
		addReply: (reply,id) => dispatch(addReplyAction(reply,id)),
		toggleExpand: (expand,id)=>dispatch(toggleExpandAction(expand,id))
	}
}

export default connect<IActionItemProps, IActionItemDispatch, IOwn>(mapStateToProps, mapDispatchToProps)(ActionItem)