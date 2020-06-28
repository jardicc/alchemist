import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IAppState, IActionView } from "../reducers/initialState";
import { getBatchPlayDecorator, getGroupSame, getIncludeArr, getExcludeArr } from "../selectors";
import { addReplyAction, toggleExpandAction, removeActionAction, filterEventNameAction, setModalBehaviorAction } from "../actions/actions";
import { IActionItemProps, IActionItemDispatch } from "./ActionItem";
import cloneDeep from "lodash/cloneDeep";
import {ActionItem} from "./ActionItem";

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
};

const mapDispatchToProps: MapDispatchToPropsFunction<IActionItemDispatch, IOwn> = (dispatch):IActionItemDispatch => {
	return {
		addReply: (reply, id) => dispatch(addReplyAction(reply, id)),
		toggleExpand: (expand, id) => dispatch(toggleExpandAction(expand, id)),
		removeAction: (id) => dispatch(removeActionAction(id)),
		filterEventName: (eventName, kind, operation) => dispatch(filterEventNameAction(eventName, kind, operation)),
		setModalBehavior: (id, modalBehavior) => dispatch(setModalBehaviorAction(id, modalBehavior))
	};
};

export const ActionItemContainer = connect<IActionItemProps, IActionItemDispatch, IOwn>(mapStateToProps, mapDispatchToProps)(ActionItem);