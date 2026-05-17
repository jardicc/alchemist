import "./ActionItem.less";

import React from "react";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {getExpandedItemsAction, getSelectedItemsAction} from "../atnSelectors";
import {IActionItemUUID, IActionSetUUID, TSelectActionOperation} from "../atnModel";
import {ActionCommand} from "./ActionCommand";
import {IconCheck, IconChevronBottom, IconChevronRight, IconEmpty} from "../../shared/components/icons";
import PS from "photoshop";
import {atnSlice} from "../atnSlice";

const { expandAction, selectAction} = atnSlice.actions;

interface IOwn {
	actionItem: IActionItemUUID
	parent: IActionSetUUID
}

export const ActionItem: React.FC<IOwn> = ({actionItem, parent: parentSet}) => {
	const dispatch = useAppDispatch();
	const selectedItems = useAppSelector(getSelectedItemsAction);
	const expandedItems = useAppSelector(getExpandedItemsAction);
	const combinedUUID: [string, string] = [parentSet.__uuid__, actionItem.__uuid__];

	const isSelected = !!selectedItems.find(item =>
		item[0] === combinedUUID[0] &&
		item[1] === combinedUUID[1]);

	const select = (e: React.MouseEvent<HTMLDivElement>) => {
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
		dispatch(selectAction(operation, combinedUUID));
	};

	const isExpanded = expandedItems.flat().includes(actionItem.__uuid__);

	const onExpand = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		dispatch(expandAction([parentSet.__uuid__, actionItem.__uuid__], !isExpanded));
	};

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
			{isExpanded && actionItem.commands?.map((item, key) => <ActionCommand parentAction={actionItem} parentSet={parentSet} actionCommand={item} key={key} />)}
		</div>
	);
};
