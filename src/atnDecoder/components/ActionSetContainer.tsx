import "./ActionSetContainer.less";

import React, {MouseEventHandler} from "react";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {setExpandActionAction, setSelectActionAction} from "../atnActions";
import {getExpandedItemsSet, getSelectedItemsSet} from "../atnSelectors";
import {IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem} from "../atnModel";
import {ActionItem} from "./ActionItemContainer";
import {IconArrowBottom, IconArrowRight, IconCheck, IconChevronBottom, IconChevronRight, IconCircleCheck, IconEmpty, IconFolder} from "../../shared/components/icons";
import PS from "photoshop";

interface IOwn {
	actionSet: IActionSetUUID
}

export const ActionSet: React.FC<IOwn> = ({actionSet}) => {
	const dispatch = useAppDispatch();
	const selectedItems = useAppSelector(getSelectedItemsSet);
	const expandedItems = useAppSelector(getExpandedItemsSet);
	const combinedUUID: [string] = [actionSet.__uuid__];

	const isSelected: boolean = !!selectedItems.find(item =>
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
		dispatch(setSelectActionAction(operation, combinedUUID));
	};

	const isExpanded = expandedItems.flat().includes(actionSet.__uuid__);

	const onExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		const recursive = (e.ctrlKey || e.metaKey);
		dispatch(setExpandActionAction([actionSet.__uuid__], !isExpanded, recursive));
	};

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
			{isExpanded && actionSet.actionItems.map((item, key) => <ActionItem actionItem={item} parent={actionSet} key={key} />)}
		</div>
	);
};