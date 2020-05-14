import React, { ReactNode } from 'react'


const app = require('photoshop').app
var PhotoshopAction = require('photoshop').action;

interface AppState {
	listening: boolean
	currentID: number
	collapsed:boolean
	actions: IAction[]
	batchPlayDecorator: boolean
	lastHistoryID:number
}

interface IAction{
	id:number
	title:string
	collapsed:boolean
	descriptor:IDesc
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
			currentID: 0,
			collapsed:true,
			batchPlayDecorator:false,
			listening: false,
			actions: [],
			lastHistoryID:-1
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

	private toggleExpandAction(index:number) {
		this.setState((prevState) => {
			const obj = {
				...prevState,
				actions: [
					...prevState.actions
				]
			}

			obj.actions[index].collapsed = !obj.actions[index].collapsed;
			return obj;
		})
	}

	private async getHistoryState() {
		
		const test = await PhotoshopAction.batchPlay([
			{
				"_obj": "get",
				"_target": [
					{
						"_ref": "historyState",
						"_enum": "ordinal",
						"_value": "last"
					}
				]
			}
		], {});
		console.log(test[0].name);

		let result = ""

		if (test[0].ID!==this.state.lastHistoryID && this.state.lastHistoryID !== -1) {
			result =  " | "+test[0].name;
		}

		this.setState((prevState) => {
			return {
				...prevState,
				lastHistoryID:test[0].ID
			}
		})

		return result;
	}

	private renderActions() {
		const actions = this.state.actions;
		const elements: ReactNode[] = [];
		
		for (let i = 0; i < actions.length; i++) {
			const action = actions[i];
			elements.unshift(
				<div className="action" key={i}>
					<div className="header">						
						<sp-action-button onClick={() => this.toggleExpandAction(i)} className="collapse">{action.collapsed ? "⯈" : "⯆"}{" "+action.title}</sp-action-button>						
						<button onClick={() => this.copy(i)}  className="margin-left">copy</button>
					</div>
					{
						action.collapsed?null:
						<div>
							{this.decorateCode(action.descriptor)}
						</div>
					}
				</div>
			)
		}
			
		return elements;
	}

	private clearLog() {
		this.setState((prevState) => {
			return {
				...prevState,
				actions: []
			}
		})
	}

	public render() {
		const batchPlay = this.state.batchPlayDecorator;
		const collapsed = this.state.collapsed;

		return (
			<div className="component">
				<div className="flex-row start controls">
					{this.state.listening ? <button onClick={() => this.removeListener()}>Stop</button> : <button onClick={() => this.attachListener()}>Start</button>}
					<button onClick={() => this.clearLog()}>Clear</button>
					{batchPlay ? <button onClick={() => this.onBatchPlay(false)}>Raw code</button> : <button onClick={() => this.onBatchPlay(true)}>Batch play code</button>}
					<sp-checkbox onClick={this.toggleCollapseOption} checked>Collapsed</sp-checkbox>
				</div>
				<div className="code">
					{this.renderActions()}
				</div>
			</div>
		);
	}

	private toggleCollapseOption = (e) => {
		const value = e.target.checked;
		console.log(value);
		this.setState((prevState) => {			
			return {
				...prevState,
				collapsed:value
			}
		})
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
		const historyName = await this.getHistoryState();
		this.setState((prevState) => {
			message = {
				_obj: event,
				...message
			}

			return {
				actions: [
					...prevState.actions,
					{
						collapsed:prevState.collapsed,
						descriptor: message,
						id: prevState.currentID,
						title:message._obj +historyName
					}
					
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
		const text = this.decorateCode(this.state.actions[index].descriptor);
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
