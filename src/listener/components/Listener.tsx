import React, { ReactNode } from "react";
import { app, action } from "../../imports";
import { IAppState, IAction, ISettings, IActionView } from "../reducers/initialStateListener";
import {ActionItemContainer} from "./ActionItemContainer";
import {FilterContainer} from "./FilterContainer";
import { Settings } from "../classes/Settings";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const manifest = require("./../../../uxp/manifest.json");

export interface IListenerProps{
	settings: ISettings
	groupSame:boolean
	actions: IActionView[]
	wholeState: IAppState
}

export interface IListenerDispatch{
	setCollapsed(enabled: boolean): void
	setListener(enabled:boolean):void
	addAction(action:IAction):void
	setBatchPlayDecorator(enabled:boolean):void
	setGroupSame(enabled:boolean):void
	clearLog():void
	setLastHistoryID(id: number): void
	incrementActionID(): void
	setWholeState(data:IAppState,append:boolean):void
}

type TListener = IListenerProps & IListenerDispatch


/**
 * Usage of the Photoshop event listening APIs.
 * This section of the APIs are subject to sweeping changes.
 */
export class Listener extends React.Component<TListener> {
	constructor(props:TListener) {
		super(props);
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

		let result = "";

		if (test[0].ID!==this.props.settings.lastHistoryID && this.props.settings.lastHistoryID !== -1 && test[0].name.trim()) {
			result =  test[0].name;
		}

		this.props.setLastHistoryID(test[0].ID);

		return result;
	}

	private renderActions=()=> {
		const actions = this.props.actions;
		if (actions.length) {
			const elements: ReactNode[] = actions.map(action => <ActionItemContainer key={action.id} action={action}  />);
			return elements;
		} else {
			return (
				<div className="empty">
					<div className="message">
						<p>No actions to show.</p>
						<p>Please start recording or make sure that filters are set properly.</p>
					</div>
				</div>
			);
		}
	}

	private clearLog=()=> {
		this.props.clearLog();
	}

	private toggleCollapseOption = (e:any) => {
		const value = e.target.checked;
		this.props.setCollapsed(value);
	}

	private onBatchPlay = (e: any) => {		
		const value = e.target.checked;
		this.props.setBatchPlayDecorator(value);
	}

	/**
	 * Listener to be attached to all Photoshop notifications.
	 */
	public  listener = async (event: string, descriptor: any):Promise<void> => {
		const {collapsed} = this.props.settings;

		const historyName = await this.getHistoryState();
		this.props.addAction({
			collapsed:collapsed,
			descriptor: {
				_obj: event,
				...descriptor
			},
			id: NaN, // will be set within reducer
			playReplies: [],
			timeCreated: Date.now(),
			historyStepTitle: historyName,
			eventName: event,
			modalBehavior: "fail"
		});
		this.props.setLastHistoryID;
	}

	/**
	 * Attaches the simple listener to the app.
	 */
	private attachListener = async() => {
		app.eventNotifier = this.listener;		
		this.props.setListener(true);
	}

	private onGroupSame =(e: any) => {		
		const value = e.target.checked;
		this.props.setGroupSame(value);
	}

	private exportState = () => {
		Settings.saveSettingsWithDialog(this.props.wholeState);
	}

	private importState = async () => {
		const data = await Settings.importStateWithDialog();
		if(!data){return;}
		this.props.setWholeState(data,false);
	}
	
	private appendActions = async () => {
		const data = await Settings.importStateWithDialog();
		if(!data){return;}
		this.props.setWholeState(data,true);
	}

	/**
	 * Attaches a null listener to the app.
	 */
	private removeListener = async() => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const app = require("photoshop").app;
		app.eventNotifier = undefined;

		this.props.setListener(false);
	}

	public render():JSX.Element {
		const { collapsed, batchPlayDecorator } = this.props.settings;
		const { groupSame } = this.props;

		return (
			<div className="component">
				<FilterContainer  />
				<div className="actionList">
					{this.renderActions()}
				</div>
				<div className="flex-row start controls">
					{this.props.settings.listening ?
						<sp-button variant="primary" onClick={this.removeListener}>Stop</sp-button> :
						<sp-button variant="cta" onClick={this.attachListener}>Start</sp-button>
					}
					<sp-button quiet variant="secondary" onClick={this.clearLog}>Clear</sp-button>
					<sp-button quiet variant="secondary" onClick={this.exportState}>Export...</sp-button>
					<sp-button quiet variant="secondary" onClick={this.importState}>Import...</sp-button>
					<sp-button quiet variant="secondary" onClick={this.appendActions}>Import append...</sp-button>
					<div className="spread"></div>
					{/*batchPlay ? <sp-button quiet variant="secondary" onClick={() => this.onBatchPlay(false)}>Raw code</sp-button > : <sp-button quiet variant="secondary" onClick={() => this.onBatchPlay(true)}>Batch play code</sp-button >*/}
					<div className="flex-row start">
						<sp-checkbox onClick={this.onGroupSame} checked={groupSame ? true : null}>Group same</sp-checkbox>
						<sp-checkbox onClick={this.onBatchPlay} checked={batchPlayDecorator ? true : null}>Playable code</sp-checkbox>
						<sp-checkbox onClick={this.toggleCollapseOption} checked={collapsed ? true : null}>Collapsed</sp-checkbox>
						<span className="version">v. {manifest.version}</span>
					</div>
				</div>
			</div>
		);
	}
}
