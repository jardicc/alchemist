import "./ActionSetContainer.less";

import React, {MouseEventHandler} from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {IRootState} from "../../shared/store";
import {setExpandActionAction, setSelectActionAction} from "../atnActions";
import {getExpandedItemsSet, getSelectedItemsSet} from "../atnSelectors";
import {IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem} from "../atnModel";
import {ActionItemContainer} from "./ActionItemContainer";
import {IconArrowBottom, IconArrowRight, IconCheck, IconChevronBottom, IconChevronRight, IconCircleCheck, IconEmpty, IconFolder} from "../../shared/components/icons";
import PS from "photoshop";

export const ActionSet: React.FC<TActionSet> = (props) => {
	const combinedUUID: [string] = [props.actionSet.__uuid__];

	const isSelected: boolean = !!props.selectedItems.find(item =>
		item[0] === combinedUUID[0]);

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

	const isExpanded = props.expandedItems.flat().includes(props.actionSet.__uuid__);

	const onExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		const {actionSet} = props;
		const recursive = (e.ctrlKey || e.metaKey);
		props.setExpandedItem([actionSet.__uuid__], !isExpanded, recursive);
	};

	const {actionSet} = props;

	return (
		<div className="ActionSet">
			<div className={"wrap " + (isSelected ? "selected" : "")} onClick={select}>
				<div className="checkmark">
					{(actionSet.actionItems?.every(aItem => aItem.commands?.every(item => item.enabled) ?? true) ?? true) ? <IconCheck /> : <IconEmpty />}
				</div>
				<div className="expand" onClick={onExpand}>
					{isExpanded ? <IconChevronBottom /> : <IconChevronRight />}
				</div>
				<IconFolder />
				<span className="title">
					{PS.core.translateUIString(actionSet.actionSetName)}
				</span>
			</div>
			{isExpanded && actionSet.actionItems.map((item, key) => <ActionItemContainer actionItem={item} parent={actionSet} key={key} />)}
		</div>
	);
};

type TActionSet = IActionSetProps & IActionSetDispatch

interface IActionSetState {

}

interface IOwn {
	actionSet: IActionSetUUID
}

interface IActionSetProps {
	selectedItems: TSelectedItem[]
	expandedItems: TExpandedItem[]
	actionSet: IActionSetUUID
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IActionSetProps => (state = state as IRootState, {
	actionSet: ownProps.actionSet,
	expandedItems: getExpandedItemsSet(state),
	selectedItems: getSelectedItemsSet(state),

});

interface IActionSetDispatch {
	setSelectedItem(uuid: TSelectedItem, operation: TSelectActionOperation): void
	setExpandedItem(uuid: TExpandedItem, expand: boolean, recursive: boolean): void
}

const mapDispatchToProps = (dispatch: Dispatch): IActionSetDispatch => ({
	setExpandedItem: (uuid, expand, recursive) => dispatch(setExpandActionAction(uuid, expand, recursive)),
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation, uuid)),
});

export const ActionSetContainer = connect<IActionSetProps, IActionSetDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(ActionSet);