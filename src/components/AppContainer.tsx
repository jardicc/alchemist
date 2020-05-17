import { connect } from 'react-redux'
import App, { IAppProps, IAppDispatch } from './App'
import { IAppState } from '../reducers/initialState'

const mapStateToProps = (state: IAppState): IAppProps => ({
})

const mapDispatchToProps = (dispatch: any):IAppDispatch => {
	return {
	}
}

export default connect<IAppProps, IAppDispatch>(mapStateToProps, mapDispatchToProps)(App)