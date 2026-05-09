import "./ActionCommandContainer.less";

import React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {IRootState} from "../../shared/store";
import {setSelectActionAction} from "../atnActions";
import {getSelectedItemsCommand} from "../atnSelectors";
import {IActionCommandUUID, IActionItemUUID, IActionSetUUID, TSelectActionOperation, TSelectedItem} from "../atnModel";
import {IconCheck, IconEmpty} from "../../shared/components/icons";
import PS from "photoshop";

export const ActionCommand: React.FC<TActionCommand> = (props) => {
	const combinedUUID: [string, string, string] = [props.parentSet.__uuid__, props.parentAction.__uuid__, props.actionCommand.__uuid__];

	const isSelected: boolean = !!props.selectedItems.find(item =>
		item[0] === combinedUUID[0] &&
		item[1] === combinedUUID[1] &&
		item[2] === combinedUUID[2]);

	const select = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();

		let operation: TSelectActionOperation = "replace";

		if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
			operation = "subtractContinuous";
		} else if (e.shiftKey) {
			operation = "addContinuous";
		} else if (e.ctrlKey || e.metaKey) {
			if (isSelected) {
				operation = "subtract";
			} else {
				operation = "add";
			}
		}
		props.setSelectedItem(combinedUUID, operation);
	};

	const {actionCommand} = props;

	return (
		<div className="ActionCommandContainer">
			<div className={"wrap " + (isSelected ? "selected" : "")} onClick={select}>
				<div className="checkmark">
					{actionCommand.enabled ? <IconCheck /> : <IconEmpty />}
				</div>
				<span className="title">
					{PS.core.translateUIString(actionCommand.commandName)}
				</span>
			</div>
		</div>
	);
};

type TActionCommand = IActionCommandProps & IActionCommandDispatch

interface IActionCommandState {

}

interface IOwn {
	actionCommand: IActionCommandUUID
	parentSet: IActionSetUUID
	parentAction: IActionItemUUID
}

interface IActionCommandProps {
	parentSet: IActionSetUUID
	parentAction: IActionItemUUID
	selectedItems: TSelectedItem[]
	actionCommand: IActionCommandUUID
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IActionCommandProps => (state = state as IRootState, {
	actionCommand: ownProps.actionCommand,
	selectedItems: getSelectedItemsCommand(state),
	parentSet: ownProps.parentSet,
	parentAction: ownProps.parentAction,
});

interface IActionCommandDispatch {
	setSelectedItem(uuid: TSelectedItem, operation: TSelectActionOperation): void
}

const mapDispatchToProps = (dispatch: Dispatch): IActionCommandDispatch => ({
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation, uuid)),
});

export const ActionCommandContainer = connect<IActionCommandProps, IActionCommandDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(ActionCommand);