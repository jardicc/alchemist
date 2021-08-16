import { IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem } from "../types/model";

export interface ISetDataAction {
	type: "SET_DATA"
	payload: IActionSetUUID
}

export interface ISelectAction {
	type: "SELECT_ACTION"
	payload: {
		operation:TSelectActionOperation
		uuid?: TSelectedItem
	}
}

export interface IExpandAction {
	type: "EXPAND_ACTION"
	payload: {
		uuid: TExpandedItem
		expand: boolean
	}
}

export function setDataAction(data:IActionSetUUID): ISetDataAction{
	return {
		type: "SET_DATA",
		payload: data,
	};
}

export function setSelectActionAction(operation: TSelectActionOperation, uuid?:TSelectedItem): ISelectAction {
	return {
		type: "SELECT_ACTION",
		payload: {operation,uuid},
	};
}

export function setExpandActionAction(uuid: TExpandedItem, expand:boolean): IExpandAction {
	return {
		type: "EXPAND_ACTION",
		payload: {uuid, expand},
	};
}


export type TAtnActions = ISetDataAction|ISelectAction|IExpandAction