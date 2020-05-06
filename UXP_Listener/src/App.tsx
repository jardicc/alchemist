// App imports
import React from 'react'
import './App.css'

import Listener from './components/Listener'

export default class App extends React.Component {
	constructor(props) {
		super(props)
	}

	public render() {
		return (
			<div className="panel">
				<Listener />
			</div>
		)
	}
}
