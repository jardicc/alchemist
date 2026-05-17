import "./ActionSet.less";

import React from "react";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {getExpandedItemsSet, getSelectedItemsSet} from "../atnSelectors";
import {IActionSetUUID, TSelectActionOperation} from "../atnModel";
import {ActionItem} from "./ActionItem";
import {IconCheck, IconChevronBottom, IconChevronRight, IconEmpty, IconFolder} from "../../shared/components/icons";
import PS from "photoshop";
import {atnSlice} from "../atnSlice";

interface IActionSetProps {
	actionSet: IActionSetUUID
}

const { expandAction, selectAction} = atnSlice.actions


export const ActionSet: React.FC<IActionSetProps> = ({actionSet}) => {
	const dispatch = useAppDispatch();
	const selectedItems = useAppSelector(getSelectedItemsSet);
	const expandedItems = useAppSelector(getExpandedItemsSet);
	const combinedUUID: [string] = [actionSet.__uuid__];

	const isSelected = !!selectedItems.find(item =>
		item[0] === combinedUUID[0]);

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

	const isExpanded = expandedItems.flat().includes(actionSet.__uuid__);

	const onExpand = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		const recursive = (e.ctrlKey || e.metaKey);
		dispatch(expandAction([actionSet.__uuid__], !isExpanded, recursive));
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
