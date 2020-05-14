// App imports
import React from 'react'
import './App.css'

import Listener from './components/Listener'

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'sp-button': any;
			'sp-action-button': any;
			'sp-checkbox': any;
			'sp-menu': any;
			'sp-menu-item': any;
			'sp-menu-divider': any;
			'sp-dropdown': any;
			'sp-radio-group': any;
			'sp-radio': any;
			'sp-search': any;
			'sp-slider': any;
			'sp-switch': any;
			'sp-tab': any;
			'sp-tab-list': any;
			'sp-tags': any;
			'sp-tag': any;
			'sp-textfield': any;
			'sp-tooltip': any;
		}
	}
}

export default class App extends React.Component {
	constructor(props) {
		super(props)
	}

	public render() {
		return (
			<div className="panel">
				{/*<div>
					<sp-checkbox>Web component</sp-checkbox>
				</div>
					<div>
						<sp-radio-group selected="first" name="example">
							<sp-radio value="first">Option 1</sp-radio>
							<sp-radio value="second">Option 2</sp-radio>
						</sp-radio-group>
					</div>
				<sp-slider></sp-slider>*/}
				<Listener />
			</div>
		)
	}
}
