import { connect } from 'react-redux'
import App, { IAppProps, IAppDispatch } from './App'
import { IAppState, IAction, ISettings } from '../reducers/initialState'
import { getCollapsedDefault, getSettings, getActions, getGroupSame } from '../selectors'
import { toggleCollapseOptionAction, setListenerAction, addActionActin, setBatchPlayDecoratorAction, clearLogAction, setHistoryIDAction, incrementActionIDAction, groupSameAction } from '../actions/actions'
import Listener, { IListenerDispatch, IListenerProps } from './Listener'

const mapStateToProps = (state: IAppState): IListenerProps => ({
	settings: getSettings(state),
	actions: getActions(state),
	groupSame: getGroupSame(state)
});

const mapDispatchToProps = (dispatch: any):IListenerDispatch => {
	return {
		setGroupSame:(enabled)=>dispatch(groupSameAction(enabled)),
		setCollapsed: (enabled) => dispatch(toggleCollapseOptionAction(enabled)),
		setListener: (enabled) => dispatch(setListenerAction(enabled)),
		addAction: (action) => dispatch(addActionActin(action)),
		setBatchPlayDecorator: (enabled) => dispatch(setBatchPlayDecoratorAction(enabled)),
		clearLog: () => dispatch(clearLogAction()),
		setLastHistoryID: (id) => dispatch(setHistoryIDAction(id)),
		incrementActionID:()=>dispatch(incrementActionIDAction()),
	}
}

export default connect<IListenerProps, IListenerDispatch>(mapStateToProps, mapDispatchToProps)(Listener)