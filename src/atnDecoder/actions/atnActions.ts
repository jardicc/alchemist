import { IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem } from "../types/model";

export interface ISetDataAction {
	type: "[ATN] SET_DATA"
	payload: IActionSetUUID
}

export interface ISelectAction {
	type: "[ATN] SELECT_ACTION"
	payload: {
		operation:TSelectActionOperation
		uuid?: TSelectedItem
	}
}

export interface IExpandAction {
	type: "[ATN] EXPAND_ACTION"
	payload: {
		uuid: TExpandedItem
		expand: boolean
	}
}

export interface IClearAllAction {
	type: "[ATN] CLEAR_ALL"
	payload: null
}

export function clearAllAction(): IClearAllAction{
	return {
		type: "[ATN] CLEAR_ALL",
		payload: null,
	};
}

export function setDataAction(data:IActionSetUUID): ISetDataAction{
	return {
		type: "[ATN] SET_DATA",
		payload: data,
	};
}

export function setSelectActionAction(operation: TSelectActionOperation, uuid?:TSelectedItem): ISelectAction {
	return {
		type: "[ATN] SELECT_ACTION",
		payload: {operation,uuid},
	};
}

export function setExpandActionAction(uuid: TExpandedItem, expand:boolean): IExpandAction {
	return {
		type: "[ATN] EXPAND_ACTION",
		payload: {uuid, expand},
	};
}


export type TAtnActions = ISetDataAction|ISelectAction|IExpandAction|IClearAllAction