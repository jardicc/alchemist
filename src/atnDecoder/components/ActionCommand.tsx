import "./ActionCommand.less";

import React from "react";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {setSelectActionAction} from "../atnActions";
import {getSelectedItemsCommand} from "../atnSelectors";
import {IActionCommandUUID, IActionItemUUID, IActionSetUUID, TSelectActionOperation, TSelectedItem} from "../atnModel";
import {IconCheck, IconEmpty} from "../../shared/components/icons";
import PS from "photoshop";

interface IOwn {
	actionCommand: IActionCommandUUID
	parentSet: IActionSetUUID
	parentAction: IActionItemUUID
}

export const ActionCommand: React.FC<IOwn> = ({actionCommand, parentSet, parentAction}) => {
	const dispatch = useAppDispatch();
	const selectedItems = useAppSelector(getSelectedItemsCommand);
	const combinedUUID: [string, string, string] = [parentSet.__uuid__, parentAction.__uuid__, actionCommand.__uuid__];

	const isSelected = !!selectedItems.find(item =>
		item[0] === combinedUUID[0] &&
		item[1] === combinedUUID[1] &&
		item[2] === combinedUUID[2]);

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
		dispatch(setSelectActionAction(operation, combinedUUID));
	};

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
