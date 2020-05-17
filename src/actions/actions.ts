import { IAction, IPlayReply } from "../reducers/initialState"

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

export type TActions = IToggleCollapseOptionAction |
	ISetListenerAction |
	IAddActionAction |
	ISetBatchPlayDecoratorAction |
	IClearLogAction |
	ISetHistoryIDAction |
	IAddReplyActionAction |
	IToggleExpandActionAction |
	IIncrementActionIDAction |
	ISetSearchTermAction