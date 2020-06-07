import React from 'react'
import { IAction, IPlayReply, IActionView } from '../reducers/initialState'
import { ActionDescriptor } from 'photoshop/dist/types/photoshop'
import { action } from '../imports'
import type { CommandOptions } from 'photoshop/dist/types/UXP'

export interface IActionItemProps{
	action:IActionView
	batchPlayDecorator: boolean
	groupSame: boolean
	exclude: string[]
	include: string[]
}

export interface IActionItemDispatch{
	addReply: (reply: IPlayReply,id:number) => void
	toggleExpand: (expand: boolean, id: number) => void
	removeAction: (id: number) => void
	filterEventName: (eventName:string, kind:"include"|"exclude", operation: "add"|"remove")=>void
}

interface IActionItemState{
	expandedOptionMenu: boolean
}

type TActionItem = IActionItemProps & IActionItemDispatch

export default class ActionItem extends React.Component<TActionItem, IActionItemState> {
	
	private _isMounted:boolean = false;

	constructor(props: TActionItem) {
		super(props);

		this.state = {
			expandedOptionMenu: false,
		};
	}

	componentDidMount() {
		this._isMounted = true;
	}
	
	componentWillUnmount() {
		this._isMounted = false;		
	}

	private async copyToClipboard(text: string) {
		await action.batchPlay([{
			_obj: "textToClipboard",
			textData: text
		}], {})
	}

	private copy = () => {
		const text = this.decorateCode(this.props.action.descriptor);
		this.copyToClipboard(text);
	}

	private decorateCode = (desc: ActionDescriptor): string => {
		const codeStr = JSON.stringify(desc, null, 3)

		if (this.props.batchPlayDecorator) {
			const options = {
				modalBehavior: "fail",
				synchronousExecution: false,
			}
			const result = "await PhotoshopAction.batchPlay([\n" + codeStr + "\n], " + JSON.stringify(options, null, "\t") + ")";
			return result;
		} else {
			return codeStr;
		}
	}

	private toggleExpandAction = () => {
		this.props.toggleExpand(!this.props.action.collapsed, this.props.action.id);
		
	}

	private toggleOptionsMenu = () => {
		this.setState({
			...this.state,
			expandedOptionMenu: !this.state.expandedOptionMenu
		}, () => {
				if (this.state.expandedOptionMenu) {
					(this.refs.actionMenu as any).focus();
			}
		});
	}

	private closeOptionsMenu = (e:any) => {
		setTimeout(() => { 
			if (this._isMounted) {
				this.setState({
					...this.state,
					expandedOptionMenu: false
				})				
			}
		},200)
	}

	private play = async () => {
		const result = await action.batchPlay([this.props.action.descriptor], {});
		this.props.addReply({
			descriptors: result,
			time: Date.now()
		}, this.props.action.id);
	}

	private renderGroupCounter = () => {
		const { action, groupSame } = this.props;
		if (!groupSame || action.groupedCounter === 1) {
			return null;
		}
		return <span className="sameGroupBadge">{action.groupedCounter}</span>
	}

	private renderReplies = () => {
		const action = this.props.action;
		
		if (action.playReplies.length) {
			return (
				<div className="replies">
					<div className="header">Replies:</div>
					<div className="code">{JSON.stringify(action.playReplies.map(reply => reply.descriptors[0]), null, 3)}</div>
				</div>
			)
		}
		else {
			return null;
		}
	}

	public renderActionContent = () => {
		const { action } = this.props;
		if (action.collapsed) {
			return null;
		}
		
		const result = <React.Fragment>
			<div className="code">
				{this.decorateCode(action.descriptor)}
			</div>
			{this.renderReplies()}
		</React.Fragment>;
		
		return result;
	}

	private optionsMenuClicked = (e:any) => {
		console.log(e.target.value);
		const { action } = this.props;
		const choice = e.target.value;
		switch (choice) {
			case "removeAction": this.props.removeAction(action.id); break;
			case "playAction": this.play(); break;
			case "includeAddFilter": this.props.filterEventName(action.eventName, "include", "add"); break;
			case "includeRemoveFilter": this.props.filterEventName(action.eventName, "include", "remove"); break;
			case "excludeAddFilter": this.props.filterEventName(action.eventName, "exclude","add"); break;
			case "excludeRemoveFilter": this.props.filterEventName(action.eventName, "exclude","remove"); break;
			default: console.log("Unknown action: ", choice);
		}
	}

	private renderOptionsMenu = () => {
		const {include,exclude,action} = this.props;
		return (
			<div className="menuHolder">
				<sp-button quiet variant="secondary" title="play" onClick={this.toggleOptionsMenu}>{this.state.expandedOptionMenu?"×":"•••"}</sp-button>
				{!this.state.expandedOptionMenu ? null : <div className="menu">
					<sp-menu slot="options" ref="actionMenu" tabindex="1" onBlur={this.closeOptionsMenu} onClick={this.optionsMenuClicked}>
						<sp-menu-group>
							<span slot="header">Action</span>
							<sp-menu-item value="playAction">Play</sp-menu-item>
							<sp-menu-item value="removeAction">Remove</sp-menu-item>
						</sp-menu-group>
						<sp-menu-divider></sp-menu-divider>
						<sp-menu-group>
							<span slot="header">Filter event name</span>
							{include.includes(action.eventName) ?
								<sp-menu-item value="includeRemoveFilter">Include (remove)</sp-menu-item>:
								<sp-menu-item value="includeAddFilter">Include (add)</sp-menu-item>
							}
							{exclude.includes(action.eventName) ?
								<sp-menu-item value="excludeRemoveFilter">Exclude (remove)</sp-menu-item>:
								<sp-menu-item value="excludeAddFilter">Exclude (add)</sp-menu-item>
							}
						</sp-menu-group>
					</sp-menu>
				</div>}
			</div>
		)
	}

	public render() {
		const { action } = this.props;
		const expandIcon = action.collapsed ? "⮞" : "⮟";
		const title = expandIcon + " " + action.eventName + (action.historyStepTitle ? " | " : "") + action.historyStepTitle;
		return (
			<React.Fragment>
				<div className="action" key={action.id}>
					<div className="header">
						<sp-button quiet variant="primary" onClick={this.toggleExpandAction} className="collapse">{title}</sp-button>
						<div className="spread"></div>
						{this.renderGroupCounter()}
						{/*<sp-button quiet variant="secondary" title="play" onClick={this.play}>Play</sp-button>*/}
						<sp-button quiet variant="secondary" title="copy" onClick={this.copy}>Copy</sp-button>
						{this.renderOptionsMenu()}
					</div>
					{this.renderActionContent()}
				</div>
			</React.Fragment>
		)
	}
}
