// App imports
import React from 'react'
import './App.css'

import ListenerContainer from './ListenerContainer'

export interface IAppProps{
}

export interface IAppDispatch{
}

type TApp = IAppProps & IAppDispatch

export default class App extends React.Component<TApp> {
	constructor(props:TApp) {
		super(props)
	}

	public render() {
		return (
			<div className="panel">
				<ListenerContainer />
			</div>
		)
	}
}
