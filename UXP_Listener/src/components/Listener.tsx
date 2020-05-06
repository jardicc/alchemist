import React, { ReactNode } from 'react'


const app = require('photoshop').app
var PhotoshopAction = require('photoshop').action;

interface AppState {
	listening: boolean
	descriptors: TDesc[]
	batchPlayDecorator:boolean
}

interface IDesc{
	_obj:string
}

type TDesc = IDesc & object

/**
 * Usage of the Photoshop event listening APIs.
 * This section of the APIs are subject to sweeping changes.
 */
export default class ListenerComponent extends React.Component<{}, AppState> {
	constructor(props) {
		super(props)
		this.state = {
			batchPlayDecorator:false,
			listening: false,
			descriptors:[]
		}

		this.listener = this.listener.bind(this)
	}

	private decorateCode(desc: TDesc): string{
		const codeStr = JSON.stringify(desc, null, 3)

		if (this.state.batchPlayDecorator) {
			const result = "await PhotoshopAction.batchPlay([\n"+codeStr+"\n], {})";
			return result;			
		} else {
			return codeStr;
		}
	}

	private renderActions() {
		const descriptors = this.state.descriptors;
		const elements: ReactNode[] = [];
		
		for (let i = 0; i < descriptors.length; i++) {
			const desc = descriptors[i];
			elements.unshift(
				<div className="action" key={i}>
					<div className="flex-row">
						<button onClick={() => this.copy(i)}  className="margin-left">copy</button>
					</div>
					<div>
						{this.decorateCode(desc)}
					</div>
				</div>
			)
		}
			
		return elements;
	}

	private clearLog() {
		this.setState((prevState) => {
			return {
				...prevState,
				descriptors: []
			}
		})
	}

	public render() {
		const batchPlay = this.state.batchPlayDecorator;

		return (
			<div className="component">
				<div className="flex-row start controls">
					{this.state.listening ? <button onClick={() => this.removeListener()}>Stop</button> : <button onClick={() => this.attachListener()}>Start</button>}
					<button onClick={() => this.clearLog()}>Clear</button>
					{batchPlay ? <button onClick={() => this.onBatchPlay(false)}>Raw code</button>:<button onClick={() => this.onBatchPlay(true)}>Batch play code</button>}
				</div>
				<div className="code">
					{this.renderActions()}
				</div>
			</div>
		);
	}

	private onBatchPlay(enabled:boolean) {
		this.setState((prevState) => {
			return {
				...prevState,
				batchPlayDecorator: enabled
			}
		})
	}

	/**
	 * Listener to be attached to all Photoshop notifications.
	 */
	public async listener(event: string, message: TDesc) {
		this.setState((prevState) => {
			message = {
				_obj: event,
				...message
			}

			return {
				descriptors: [
					...prevState.descriptors,
					message
				]
			}
		})
	}

	/**
	 * Attaches the simple listener to the app.
	 */
	private async attachListener() {
		app.eventNotifier = this.listener
		this.setState({ listening: true })
	}

	private copy(index: number) {
		const text = this.decorateCode(this.state.descriptors[index]);
		this.copyToClipboard(text);
	}

	private async copyToClipboard(text:string) {
		await PhotoshopAction.batchPlay([{
			_obj: "textToClipboard",
			textData: text
		}], {})
	}

	/**
	 * Attaches a null listener to the app.
	 */
	private async removeListener() {
		const app = require('photoshop').app
		app.eventNotifier = undefined

		this.setState({
			listening: false,
		})
	}
}
