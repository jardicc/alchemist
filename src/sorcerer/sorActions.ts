import { TSelectActionOperation, TSelectedItem } from "../atnDecoder/atnModel";


export interface ISelectAction {
	type: "[SOR] SELECT"
	payload: {
		operation: "replace"
		type: "panel" | "command" | "snippet" | "general"
		uuid?: string
	}
}

export interface IMakeAction {
	type: "[SOR] MAKE"
	payload: {
		type: "panel" | "command" | "snippet"
	}
}

export interface IRemoveAction {
	type: "[SOR] REMOVE"
	payload: {
		type: "panel" | "command" | "snippet"
		uuid:string
	}
}


export function setSelectAction(type: "panel" | "command" | "snippet" | "general", uuid: null | string = null): ISelectAction {
	return {
		type: "[SOR] SELECT",
		payload: {
			operation: "replace",
			uuid,
			type,
		},
	};
}

export function makeAction(type: "panel" | "command" | "snippet"):IMakeAction{
	return{
		type:"[SOR] MAKE",
		payload:{
			type,
		},
	};
}
export function removeAction(type: "panel" | "command" | "snippet", uuid:string):IRemoveAction{
	return{
		type:"[SOR] REMOVE",
		payload:{
			type,
			uuid,
		},
	};
}

export type TSorActions = ISelectAction|IMakeAction|IRemoveAction