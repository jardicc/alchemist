import "./ActionItemContainer.less";

import React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {IRootState} from "../../shared/store";
import {getExpandedItemsAction, getSelectedItemsAction} from "../atnSelectors";
import {setExpandActionAction, setSelectActionAction} from "../atnActions";
import {IActionItemUUID, IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem} from "../atnModel";
import {ActionCommandContainer} from "./ActionCommandContainer";
import {IconArrowBottom, IconArrowRight, IconCheck, IconChevronBottom, IconChevronRight, IconCircleCheck, IconEmpty} from "../../shared/components/icons";
import PS from "photoshop";

export const ActionItem: React.FC<TActionItem> = (props) => {
	const combinedUUID: [string, string] = [props.parentSet.__uuid__, props.actionItem.__uuid__];

	const isSelected: boolean = !!props.selectedItems.find(item =>
		item[0] === combinedUUID[0] &&
		item[1] === combinedUUID[1]);

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

	const isExpanded = props.expandedItems.flat().includes(props.actionItem.__uuid__);

	const onExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		const {actionItem, parentSet: parent} = props;
		props.setExpandedItem([parent.__uuid__, actionItem.__uuid__], !isExpanded);
	};

	const {actionItem, parentSet} = props;

	return (
		<div className="ActionItem">
			<div className={"wrap " + (isSelected ? "selected" : "")} onClick={select}>
				<div className="checkmark">
					{(actionItem.commands?.every(item => item.enabled) ?? true) ? <IconCheck /> : <IconEmpty />}
				</div>
				<div className="expand" onClick={onExpand}>
					{isExpanded ? <IconChevronBottom /> : <IconChevronRight />}
				</div>
				<span className="title">
					{PS.core.translateUIString(actionItem.actionItemName)}
				</span>
			</div>
			{isExpanded && actionItem.commands?.map((item, key) => <ActionCommandContainer parentAction={actionItem} parentSet={parentSet} actionCommand={item} key={key} />)}
		</div>
	);
};

type TActionItem = IActionItemProps & IActionItemDispatch

interface IActionItemState {

}

interface IOwn {
	actionItem: IActionItemUUID
	parent: IActionSetUUID
}

interface IActionItemProps {
	selectedItems: TSelectedItem[]
	expandedItems: TExpandedItem[]
	actionItem: IActionItemUUID
	parentSet: IActionSetUUID
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IActionItemProps => ({
	actionItem: ownProps.actionItem,
	parentSet: ownProps.parent,
	expandedItems: getExpandedItemsAction(state),
	selectedItems: getSelectedItemsAction(state),
});

interface IActionItemDispatch {
	setSelectedItem(uuid: TSelectedItem, operation: TSelectActionOperation): void
	setExpandedItem(uuid: TExpandedItem, expand: boolean): void
}

const mapDispatchToProps = (dispatch: Dispatch): IActionItemDispatch => ({
	setExpandedItem: (uuid, expand) => dispatch(setExpandActionAction(uuid, expand)),
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation, uuid)),
});

export const ActionItemContainer = connect<IActionItemProps, IActionItemDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(ActionItem);