import React from "react";
import { IPlayReply, IActionView } from "../reducers/initialStateListener";
import { action as uxpAction } from "../../shared/imports";
import { CommandOptions } from "photoshop/dist/types/UXP";
import { showCheckmark } from "./Utils";

export interface IActionItemProps{
	action:IActionView
	batchPlayDecorator: boolean
	groupSame: boolean
	exclude: string[]
	include: string[]
}

export interface IActionItemDispatch {
	addReply: (reply: IPlayReply, id: number) => void
	toggleExpand: (expand: boolean, id: number) => void
	removeAction: (id: number) => void
	filterEventName: (eventName: string, kind: "include" | "exclude", operation: "add" | "remove") => void
	setModalBehavior: (id: number, modalBehavior: "wait" | "execute" | "fail") => void
}

interface IActionItemState{
	expandedOptionMenu: boolean
}

type TActionItem = IActionItemProps & IActionItemDispatch

export class ActionItem extends React.Component<TActionItem, IActionItemState> {
	
	private _isMounted = false;

	constructor(props: TActionItem) {
		super(props);

		this.state = {
			expandedOptionMenu: false,
		};
	}

	componentDidMount(): void {
		this._isMounted = true;
	}
	
	componentWillUnmount(): void {
		this._isMounted = false;
	}

	private actionMenu: HTMLElement | null = null;

	private async copyToClipboard(text: string) {
		await uxpAction.batchPlay([{
			_obj: "textToClipboard",
			textData: text
		}], {});
	}

	private copy = () => {
		const text = this.decorateCode(this.props.action);
		this.copyToClipboard(text);
	}

	private decorateCode = (action: IActionView): string => {
		const codeStr = JSON.stringify(action.descriptor, null, 3);

		if (this.props.batchPlayDecorator) {
			const options: CommandOptions = {
				//dialogOptions: "display",
				modalBehavior: action.modalBehavior,
				synchronousExecution: false,
			};
			const result = "await PhotoshopAction.batchPlay([\n" + codeStr + "\n], " + JSON.stringify(options, null, 3) + ")";
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
				if (this.actionMenu) {
					this.actionMenu.focus();
				}
			}
		});
	}

	private closeOptionsMenu = () => {
		setTimeout(() => {
			if (this._isMounted) {
				this.setState({
					...this.state,
					expandedOptionMenu: false
				});
			}
		}, 200);
	}

	private play = async () => {
		const {action} = this.props;
		const result = await uxpAction.batchPlay([action.descriptor], {
			modalBehavior: action.modalBehavior,
		});
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
		return <span className="sameGroupBadge">{action.groupedCounter}</span>;
	}

	private renderReplies = () => {
		const action = this.props.action;
		
		if (action.playReplies.length) {
			return (
				<div className="replies">
					<div className="header">Replies:</div>
					<div className="code">{JSON.stringify(action.playReplies.map(reply => reply.descriptors[0]), null, 3)}</div>
				</div>
			);
		}
		else {
			return null;
		}
	}

	public renderActionContent = (): JSX.Element | null => {
		const { action } = this.props;
		if (action.collapsed) {
			return null;
		}
		
		const result = <React.Fragment>
			<div className="code">
				{this.decorateCode(action)}
				{/*<textarea className="codeArea" maxLength={9999999} value={this.decorateCode(action)} style={{height:"20em"}} />*/}
			</div>
			{this.renderReplies()}
		</React.Fragment>;
		
		return result;
	}

	private optionsMenuClicked = (e: any): void => {
		console.log(e.target.value);
		const { action } = this.props;
		const choice = e.target.value;
		switch (choice) {
			case "removeAction": { this.props.removeAction(action.id); break; }
			case "playAction": { this.play(); break; }
			case "includeAddFilter": { this.props.filterEventName(action.eventName, "include", "add"); break; }
			case "includeRemoveFilter": { this.props.filterEventName(action.eventName, "include", "remove"); break; }
			case "excludeAddFilter": { this.props.filterEventName(action.eventName, "exclude", "add"); break; }
			case "excludeRemoveFilter": { this.props.filterEventName(action.eventName, "exclude", "remove"); break; }
				
			case "modalBehaviorFail": { this.props.setModalBehavior(action.id, "fail"); break; }
			case "modalBehaviorExecute": { this.props.setModalBehavior(action.id, "execute"); break; }
			case "modalBehaviorWait": { this.props.setModalBehavior(action.id, "wait"); break; }
			default: console.log("Unknown action: ", choice);
		}
	}

	private renderOptionsMenu = () => {
		const { include, exclude, action } = this.props;
		const { modalBehavior } = action;

		return (
			<div className="menuHolder">
				<sp-button
					quiet
					variant="secondary"
					title="Show more options"
					onClick={this.toggleOptionsMenu}
				>
					<sp-icon class="menuIcon" name={this.state.expandedOptionMenu ? "ui:CrossSmall" : "ui:TripleGripper"} size={this.state.expandedOptionMenu?"xs":"s"} />
				</sp-button>
				{!this.state.expandedOptionMenu ? null : <div className="menu">
					<sp-menu slot="options" ref={(ref: HTMLElement) => this.actionMenu = ref} tabindex="1" onBlur={this.closeOptionsMenu} onClick={this.optionsMenuClicked}>
						<sp-menu-group>
							<span slot="header">Action</span>
							<sp-menu-item value="playAction">Play</sp-menu-item>
							<sp-menu-item value="removeAction">Remove</sp-menu-item>
						</sp-menu-group>
						<sp-menu-divider></sp-menu-divider>
						<sp-menu-group>
							<span slot="header">Filter event name</span>
							{include.includes(action.eventName) ?
								<sp-menu-item value="includeRemoveFilter">{showCheckmark(true)} Include</sp-menu-item> :
								<sp-menu-item value="includeAddFilter">{showCheckmark(false)} Include</sp-menu-item>
							}
							{exclude.includes(action.eventName) ?
								<sp-menu-item value="excludeRemoveFilter">{showCheckmark(true)} Exclude</sp-menu-item> :
								<sp-menu-item value="excludeAddFilter">{showCheckmark(false)} Exclude</sp-menu-item>
							}
						</sp-menu-group>
						<sp-menu-divider></sp-menu-divider>
						<sp-menu-group>
							<span slot="header">Modal behavior (Dialog Modes)</span>
							<sp-menu-item value="modalBehaviorFail">{showCheckmark(modalBehavior === "fail")} Fail (Error)</sp-menu-item>
							<sp-menu-item value="modalBehaviorExecute">{showCheckmark(modalBehavior === "execute")} Execute (No)</sp-menu-item>
							<sp-menu-item value="modalBehaviorWait">{showCheckmark(modalBehavior === "wait")} Wait (All)</sp-menu-item>
						</sp-menu-group>
					</sp-menu>
				</div>}
			</div>
		);
	}

	public render(): JSX.Element {
		const { action } = this.props;
		const expandIcon = <sp-icon class="chevron" name={action.collapsed ? "ui:ChevronRightSmall" : "ui:ChevronDownSmall"} size="xxs" />;
		const title =  action.eventName + (action.historyStepTitle ? " | " : "") + action.historyStepTitle;
		return (
			<React.Fragment>
				<div className="action" key={action.id}>
					<div className="header">
						<sp-button quiet variant="primary" onClick={this.toggleExpandAction} className="collapse">{expandIcon}{title}</sp-button>
						<div className="spread"></div>
						{this.renderGroupCounter()}
						{/*<sp-button quiet variant="secondary" title="play" onClick={this.play}>Play</sp-button>*/}
						<sp-button quiet variant="secondary" title="copy" onClick={this.copy}>Copy</sp-button>
						{this.renderOptionsMenu()}
					</div>
					{this.renderActionContent()}
				</div>
			</React.Fragment>
		);
	}
}
