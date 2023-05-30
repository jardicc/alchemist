import { TSelectActionOperation, TSelectedItem } from "../atnDecoder/atnModel";
import { IEntrypointCommand, IEntrypointPanel, IHost, IManifestInfo, ISnippet, ISorcererState } from "./sorModel";


export interface ISelectAction {
	type: "[SOR] SELECT"
	payload: {
		operation: "replace"
		type: "panel" | "command" | "snippet" | "general"
		uuid: string|null
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

export type TSetCommandActionPayload = Partial<Pick<IEntrypointCommand, "id" | "label" | "$$$snippetUUID">>

export interface IAssignSnippetToPanelAction {
	type: "[SOR] ASSIGN_SNIPPET_TO_PANEL"
	payload: {
		operation: "on" | "off"
		uuid: string
		snippetUuid:string
	}
}

export interface ISetPanelHostAction {
	type: "[SOR] SET_HOST_APP"
	payload: {
		app: "PS"|"XD"
		arg: TSetPanelHostActionPayload
	}
}

export type TSetPanelHostActionPayload = Partial<Pick<IHost, "minVersion">>

export interface ISetSorcererPresetAction{
	type: "[SOR] SET_PRESET"
	payload: ISorcererState
}

export function setPresetAction(data: ISorcererState): ISetSorcererPresetAction{
	return {
		type: "[SOR] SET_PRESET",
		payload: data,
	};
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

export function assignSnippetToPanelAction(operation:"on"|"off", uuid:string, snippetUuid:string): IAssignSnippetToPanelAction{
	return {
		type: "[SOR] ASSIGN_SNIPPET_TO_PANEL",
		payload: {
			operation,
			uuid,
			snippetUuid,
		},
	};
}

export function setHostApp(app: "PS"|"XD", arg: TSetPanelHostActionPayload):ISetPanelHostAction {
	return {
		type: "[SOR] SET_HOST_APP",
		payload: {
			app,
			arg,
		},
	};
}

export type TSorActions = ISelectAction | IMakeAction | IRemoveAction | ISetMainAction | ISetPanelAction |
	ISetCommandAction | ISetSnippetAction | IAssignSnippetToPanelAction|ISetPanelHostAction|ISetSorcererPresetAction