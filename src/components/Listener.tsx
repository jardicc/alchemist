import React, { ReactNode } from 'react'
import { app, action } from "../imports"
import { ActionDescriptor} from "photoshop/dist/types/photoshop"
import { Descriptor } from 'photoshop/dist/types/UXP'

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
	descriptor: ActionDescriptor
	timeCreated: number
	playReplies: IPlayReply[]
}

interface IPlayReply{
	descriptors:Descriptor[]
	time:number
}

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

	private decorateCode(desc: ActionDescriptor): string{
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
		
		const test = await action.batchPlay([
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
		if (actions.length) {
			const elements: ReactNode[] = [];
		
			for (let i = 0; i < actions.length; i++) {
				const action = actions[i];
				elements.unshift(
					<div className="action" key={i}>
						<div className="header">
							<sp-button quiet variant="primary"  onClick={() => this.toggleExpandAction(i)} className="collapse">{action.collapsed ? "⮞" : "⮟"}{" " + action.title}</sp-button>
							<div className="spread"></div>
							<sp-button quiet variant="secondary" title="play" onClick={() => this.play(i)}>Play</sp-button>
							<sp-button quiet variant="secondary" title="copy" onClick={() => this.copy(i)}  >Copy</sp-button>
						</div>
						{
							action.collapsed ? null :
								<div className="code">
									{this.decorateCode(action.descriptor)}
								</div>
						}
					</div>
				)
			}
			
			return elements;
		} else {
			return (
				<div className="empty">
					<div className="message">No actions recorded. Please start recording.</div>
				</div>
			)
		}
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
				<div className="actionList">
					{this.renderActions()}
				</div>
				<div className="flex-row start controls">
					{this.state.listening ? <sp-button variant="negative" onClick={() => this.removeListener()}>Stop</sp-button> : <sp-button variant="cta" onClick={() => this.attachListener()}>Start</sp-button>}
					<sp-button quiet variant="secondary" onClick={() => this.clearLog()}>Clear</sp-button>
					{batchPlay ? <sp-button quiet variant="secondary" onClick={() => this.onBatchPlay(false)}>Raw code</sp-button > : <sp-button quiet variant="secondary" onClick={() => this.onBatchPlay(true)}>Batch play code</sp-button >}
					<sp-checkbox onClick={this.toggleCollapseOption} checked>Collapsed</sp-checkbox>
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
	public async listener(event: string, message: ActionDescriptor) {
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
						title: message._obj + historyName,
						timeCreated: Date.now(),
						playReplies: []
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

	private async play(index: number) {
		const result = await action.batchPlay([this.state.actions[index].descriptor], {});

		this.setState((prevState) => {
			const obj = {
				...prevState,
				actions: [
					...prevState.actions
				]
			}

			obj.actions[index].playReplies = [
				...obj.actions[index].playReplies,
				{
					descriptors: result,
					time: Date.now(),
				}
			]
			return obj;
		})
	}

	private async copyToClipboard(text:string) {
		await action.batchPlay([{
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
