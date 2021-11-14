import { TSelectActionOperation, TSelectedItem } from "../atnDecoder/atnModel";
import { IEntrypointCommand, IEntrypointPanel, IManifestInfo, ISnippet } from "./sorModel";


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

export interface ISetMainAction{
	type: "[SOR] SET_MAIN"
	payload:TSetMainActionPayload
}

export type TSetMainActionPayload = Partial<Pick<IManifestInfo,"name"|"id"|"version">>

export interface ISetSnippetAction{
	type: "[SOR] SET_SNIPPET"
	payload: {
		value: TSetSnippetActionPayload
		uuid: string
	}
}

export type TSetSnippetActionPayload= Partial<Pick<ISnippet,"label"|"code"|"version"|"author">>

export interface ISetPanelAction{
	type: "[SOR] SET_PANEL"
	payload: {
		value: TSetPanelActionPayload
		uuid: string
	}
}

export type TSetPanelActionPayload = Partial<Pick<IEntrypointPanel,"id"|"label">>

export interface ISetCommandAction{
	type: "[SOR] SET_COMMAND"
	payload: {
		value: TSetCommandActionPayload
		uuid: string
	}
}

export type TSetCommandActionPayload = Partial<Pick<IEntrypointCommand,"id"|"label">>


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
export function setMainAction(arg: TSetMainActionPayload):ISetMainAction{
	return{
		type:"[SOR] SET_MAIN",
		payload:arg,
	};
}
export function setPanelAction(arg: TSetPanelActionPayload,uuid:string):ISetPanelAction{
	return{
		type:"[SOR] SET_PANEL",
		payload:{
			value: arg,
			uuid,
		},
	};
}
export function setCommandAction(arg: TSetCommandActionPayload,uuid:string):ISetCommandAction{
	return{
		type:"[SOR] SET_COMMAND",
		payload:{
			value: arg,
			uuid,
		},
	};
}
export function setSnippetAction(arg: TSetSnippetActionPayload,uuid:string):ISetSnippetAction{
	return{
		type:"[SOR] SET_SNIPPET",
		payload:{
			value: arg,
			uuid,
		},
	};
}

export type TSorActions = ISelectAction | IMakeAction | IRemoveAction | ISetMainAction | ISetPanelAction | ISetCommandAction|ISetSnippetAction