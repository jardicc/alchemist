import { IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem } from "./atnModel";

export interface ISetDataAction {
	type: "[ATN] SET_DATA"
	payload: IActionSetUUID[]
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
		recursive:boolean
	}
}

export interface IClearAllAction {
	type: "[ATN] CLEAR_ALL"
	payload: null
}

export interface IPassSelectedAction {
	type: "[ATN] PASS_SELECTED"
	payload: null
}

export interface ISetDontSendDisabledAction {
	type: "[ATN] SET_DONT_SEND_DISABLED"
	payload: boolean
}

export function setDontSendDisabledAction(value:boolean): ISetDontSendDisabledAction{
	return {
		type: "[ATN] SET_DONT_SEND_DISABLED",
		payload: value,
	};
}

export function passSelectedAction(): IPassSelectedAction{
	return {
		type: "[ATN] PASS_SELECTED",
		payload: null,
	};
}

export function clearAllAction(): IClearAllAction{
	return {
		type: "[ATN] CLEAR_ALL",
		payload: null,
	};
}

export function setDataAction(data:IActionSetUUID[]): ISetDataAction{
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

export function setExpandActionAction(uuid: TExpandedItem, expand:boolean, recursive=false): IExpandAction {
	return {
		type: "[ATN] EXPAND_ACTION",
		payload: { uuid, expand,recursive },
		
	};
}


export type TAtnActions = ISetDataAction | ISelectAction | IExpandAction | IClearAllAction | IPassSelectedAction | ISetDontSendDisabledAction