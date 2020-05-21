import React, { ReactNode } from 'react'
import { app, action } from "../imports"
import { ActionDescriptor, BasicActionDescriptor} from "photoshop/dist/types/photoshop"
import { IAppState, IAction, ISettings } from '../reducers/initialState'
import ActionItemContainer from './ActionItemContainer'
import Filter from './Filter'
import FilterContainer from './FilterContainer'

export interface IListenerProps{
	settings: ISettings
	actions: IAction[]
}

export interface IListenerDispatch{
	setCollapsed(enabled: boolean): void
	setListener(enabled:boolean):void
	addAction(action:IAction):void
	setBatchPlayDecorator(enabled:boolean):void
	clearLog():void
	setLastHistoryID(id: number): void
	incrementActionID():void
}

type TListener = IListenerProps & IListenerDispatch


/**
 * Usage of the Photoshop event listening APIs.
 * This section of the APIs are subject to sweeping changes.
 */
export default class Listener extends React.Component<TListener> {
	constructor(props:TListener) {
		super(props)
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

		let result = ""

		if (test[0].ID!==this.props.settings.lastHistoryID && this.props.settings.lastHistoryID !== -1 && test[0].name.trim()) {
			result =  " | "+test[0].name;
		}

		this.props.setLastHistoryID(test[0].ID);

		return result;
	}

	private renderActions=()=> {
		const actions = this.props.actions;
		if (actions.length) {
			const elements: ReactNode[] = actions.map(action => <ActionItemContainer key={action.id} action={action}/>);
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
		this.props.clearLog();
	}

	private toggleCollapseOption = (e:any) => {
		const value = e.target.checked;
		this.props.setCollapsed(value);
	}

	private onBatchPlay=(enabled:boolean)=> {		
		this.props.setBatchPlayDecorator(enabled);
	}

	/**
	 * Listener to be attached to all Photoshop notifications.
	 */
	public  listener = async (event: string, message: BasicActionDescriptor) => {
		const {collapsed} = this.props.settings;

		const historyName = await this.getHistoryState();
		this.props.addAction({
			collapsed:collapsed,
			descriptor: {
				_obj: event,
				...message
			},
			id: NaN, // will be set within reducer
			playReplies: [],
			timeCreated: Date.now(),
			title: event + historyName,
		})
		this.props.setLastHistoryID
	}

	/**
	 * Attaches the simple listener to the app.
	 */
	private attachListener = async() => {
		app.eventNotifier = this.listener		
		this.props.setListener(true);
	}


	/**
	 * Attaches a null listener to the app.
	 */
	private removeListener = async() => {
		const app = require('photoshop').app
		app.eventNotifier = undefined

		this.props.setListener(false);
	}

	public render() {
		const batchPlay = this.props.settings.batchPlayDecorator;

		return (
			<div className="component">
				<FilterContainer />
				<div className="actionList">
					{this.renderActions()}
				</div>
				<div className="flex-row start controls">
					{this.props.settings.listening ? <sp-button variant="primary" onClick={this.removeListener}>Stop</sp-button> : <sp-button variant="cta" onClick={this.attachListener}>Start</sp-button>}
					<sp-button quiet variant="secondary" onClick={this.clearLog}>Clear</sp-button>
					{batchPlay ? <sp-button quiet variant="secondary" onClick={() => this.onBatchPlay(false)}>Raw code</sp-button > : <sp-button quiet variant="secondary" onClick={() => this.onBatchPlay(true)}>Batch play code</sp-button >}
					<sp-checkbox onClick={this.toggleCollapseOption} checked>Collapsed</sp-checkbox>
				</div>

			</div>
		);
	}
}
