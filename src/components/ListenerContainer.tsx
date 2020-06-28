import { connect, MapDispatchToPropsFunction } from "react-redux";
import type { IAppState } from "../reducers/initialState";
import { getSettings, getActions, getGroupSame } from "../selectors";
import { toggleCollapseOptionAction, setListenerAction, addActionActin, setBatchPlayDecoratorAction, clearLogAction, setHistoryIDAction, incrementActionIDAction, groupSameAction, replaceWholeStateAction, appendActionsAction } from "../actions/actions";
import {Listener, IListenerDispatch, IListenerProps } from "./Listener";

const mapStateToProps = (state: IAppState): IListenerProps => ({
	settings: getSettings(state),
	actions: getActions(state),
	groupSame: getGroupSame(state),
	wholeState: state
});

const mapDispatchToProps: MapDispatchToPropsFunction<IListenerDispatch, Record<string, unknown>> = (dispatch): IListenerDispatch => {
	return {
		setGroupSame: (enabled) => dispatch(groupSameAction(enabled)),
		setCollapsed: (enabled) => dispatch(toggleCollapseOptionAction(enabled)),
		setListener: (enabled) => dispatch(setListenerAction(enabled)),
		addAction: (action) => dispatch(addActionActin(action)),
		setBatchPlayDecorator: (enabled) => dispatch(setBatchPlayDecoratorAction(enabled)),
		clearLog: () => dispatch(clearLogAction()),
		setLastHistoryID: (id) => dispatch(setHistoryIDAction(id)),
		incrementActionID: () => dispatch(incrementActionIDAction()),
		setWholeState: async (data, append) => {
			if (append) {
				dispatch(appendActionsAction(data));
			} else {
				dispatch(replaceWholeStateAction(data));
			}
		}
	};
};

export const ListenerContainer = connect<IListenerProps, IListenerDispatch>(mapStateToProps, mapDispatchToProps)(Listener);