import { connect } from 'react-redux'
import App, { IAppProps, IAppDispatch } from './App'
import { IAppState } from '../reducers/initialState'
import { replaceWholeStateAction } from '../actions/actions'
import { Settings } from '../classes/Settings'

const mapStateToProps = (state: IAppState): IAppProps => ({
})

const mapDispatchToProps = (dispatch: any):IAppDispatch => {
	return {
		setWholeState: async () => {
			dispatch(replaceWholeStateAction(await Settings.loadSettings()));
			Settings.loaded = true;
		}
	}
}

export default connect<IAppProps, IAppDispatch>(mapStateToProps, mapDispatchToProps)(App)