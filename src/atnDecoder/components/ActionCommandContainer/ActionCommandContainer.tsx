import "./ActionCommandContainer.less"

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import { setSelectActionAction } from "../../actions/atnActions";
import { getSelectedItemsCommand } from "../../selectors/atnSelectors";
import { IActionCommandUUID, TExpandedItem, TSelectActionOperation, TSelectedItem } from "../../types/model";
import { IconArrowBottom, IconArrowRight, IconCheck, IconCircleCheck } from "../../../shared/components/icons";
import PS from "photoshop";

export class ActionCommand extends React.Component<TActionCommand, IActionCommandState> { 
	constructor(props: TActionCommand) {
		super(props);
	}

	public render():React.ReactNode {
		const {actionCommand } = this.props;

		return (
			<div className="ActionCommandContainer">
				<div className="wrap">
					<div className="checkmark">
						{actionCommand.enabled ? <IconCheck />:null}
					</div>
					<span className="title">
						{(PS.core as any).translateUIString(actionCommand.commandName)}
					</span>
				</div>
			</div>
		);
	}
}

type TActionCommand = IActionCommandProps & IActionCommandDispatch

interface IActionCommandState{

}

interface IOwn{
	actionCommand:IActionCommandUUID
}

interface IActionCommandProps{
	selectedItems: TSelectedItem[]
	actionCommand:IActionCommandUUID
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IActionCommandProps => (state = state as IRootState,{
	actionCommand: ownProps.actionCommand,
	selectedItems: getSelectedItemsCommand(state),
	
});

interface IActionCommandDispatch {
	setSelectedItem(uuid:TSelectedItem,operation:TSelectActionOperation): void
}

const mapDispatchToProps = (dispatch:Dispatch):IActionCommandDispatch => ({
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
});

export const ActionCommandContainer = connect<IActionCommandProps, IActionCommandDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(ActionCommand);