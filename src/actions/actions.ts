import { IAction, IPlayReply, TFilterEvents, IAppState } from "../reducers/initialState"



export interface IReplaceWholeState{
	type: "REPLACE_WHOLE_STATE",
	payload: IAppState
}

export interface IToggleCollapseOptionAction{
	type: "TOGGLE_COLLAPSE_OPTION",
	payload: boolean
}

export interface ISetListenerAction{
	type: "SET_LISTENER_ACTION",
	payload: boolean
}

export interface IAddActionAction{
	type: "ADD_ACTION_ACTION",
	payload: IAction
}

export interface ISetBatchPlayDecoratorAction{
	type: "SET_BATCH_PLAY_DECORATOR_ACTION",
	payload: boolean
}

export interface IClearLogAction{
	type: "CLEAR_LOG_ACTION",
	payload: null
}

export interface ISetHistoryIDAction{
	type: "SET_HISTORY_ID_ACTION",
	payload: number
}

export interface IIncrementActionIDAction{
	type: "INCREMENT_ACTION_ID_ACTION",
	payload: null
}


// action

export interface IAddReplyActionAction{
	type: "ADD_REPLY_ACTION_ACTION",
	payload: {
		reply: IPlayReply,
		id:number
	}
}
export interface IToggleExpandActionAction{
	type: "TOGGLE_EXPAND_ACTION_ACTION",
	payload: {
		expand:boolean
		id:number
	}
}

// filter

export interface ISetSearchTermAction{	
	type: "SET_SEARCH_TERM_ACTION",
	payload: string|null
}
export interface ISetFilterType{	
	type: "SET_FILTER_TYPE",
	payload: TFilterEvents
}

export interface ISetIncludeAction{	
	type: "SET_INCLUDE_ACTION",
	payload: string[]
}

export interface ISetExcludeAction{	
	type: "SET_EXCLUDE_ACTION",
	payload: string[]
}

export interface IGroupSameAction{	
	type: "GROUP_SAME_ACTION",
	payload: boolean
}




export function replaceWholeStateAction(state: IAppState):IReplaceWholeState {
	return {
		type: "REPLACE_WHOLE_STATE",
		payload: state
	}
}

export function toggleCollapseOptionAction(enabled: boolean):IToggleCollapseOptionAction {
	return {
		type: "TOGGLE_COLLAPSE_OPTION",
		payload: enabled
	}
}

export function setListenerAction(enabled:boolean):ISetListenerAction{
	return{
		type: "SET_LISTENER_ACTION",
		payload: enabled
	}
}

export function addActionActin(action:IAction):IAddActionAction{
	return{
		type: "ADD_ACTION_ACTION",
		payload: action
	}
}

export function setBatchPlayDecoratorAction(enabled:boolean):ISetBatchPlayDecoratorAction{
	return{
		type: "SET_BATCH_PLAY_DECORATOR_ACTION",
		payload: enabled
	}
}

export function clearLogAction():IClearLogAction{
	return{
		type: "CLEAR_LOG_ACTION",
		payload: null
	}
}

export function incrementActionIDAction():IIncrementActionIDAction{
	return{
		type: "INCREMENT_ACTION_ID_ACTION",
		payload: null
	}
}

export function setHistoryIDAction(id:number):ISetHistoryIDAction{
	return{
		type: "SET_HISTORY_ID_ACTION",
		payload: id
	}
}

export function addReplyAction(reply:IPlayReply,id:number):IAddReplyActionAction{
	return{
		type: "ADD_REPLY_ACTION_ACTION",
		payload: {
			reply,
			id
		}
	}
}

export function toggleExpandAction(expand:boolean,id:number):IToggleExpandActionAction{
	return{
		type: "TOGGLE_EXPAND_ACTION_ACTION",
		payload: {
			expand,
			id
		}
	}
}

// filter

export function setSearchTermAction(str:string|null):ISetSearchTermAction{
	return{
		type: "SET_SEARCH_TERM_ACTION",
		payload: str
	}
}

export function setFilterTypeAction(filterType:TFilterEvents): ISetFilterType{
	return {
		type: "SET_FILTER_TYPE",
		payload:filterType
	}
}

export function setIncludeAction(arr:string[]):ISetIncludeAction{
	return{
		type: "SET_INCLUDE_ACTION",
		payload:arr
	}
}
export function setExcludeAction(arr:string[]):ISetExcludeAction{
	return{
		type: "SET_EXCLUDE_ACTION",
		payload:arr
	}
}

export function groupSameAction(enabled: boolean):IGroupSameAction {
	return {
		type: "GROUP_SAME_ACTION",
		payload: enabled
	}
}

export type TActions = IToggleCollapseOptionAction |
	ISetListenerAction |
	IAddActionAction |
	ISetBatchPlayDecoratorAction |
	IClearLogAction |
	ISetHistoryIDAction |
	IAddReplyActionAction |
	IToggleExpandActionAction |
	IIncrementActionIDAction |
	ISetSearchTermAction |
	ISetFilterType |
	ISetIncludeAction |
	ISetExcludeAction |
	IGroupSameAction |
	IReplaceWholeState;