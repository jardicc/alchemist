import { getInitialState } from "./initialState";
import { TActions } from "../actions/actions";
import produce from "immer"

export const appReducer = (state = getInitialState(), action: TActions) => {
	switch (action.type) {
		case "TOGGLE_COLLAPSE_OPTION": {
			state = produce(state, draft => {
				draft.settings.collapsed = action.payload;
			})
			break;
		}
		case "ADD_ACTION_ACTION": {
			state = produce(state, draft => {
				draft.settings.currentID = state.settings.currentID + 1;
				draft.actions.unshift({
					...action.payload,
					id: state.settings.currentID + 1
				});
			})
			break;
		}
		case "CLEAR_LOG_ACTION": {
			state = produce(state,draft=>{
				draft.actions = [];
			})
			break;
		}
		case "SET_BATCH_PLAY_DECORATOR_ACTION": {
			state = produce(state,draft=>{
				draft.settings.batchPlayDecorator = action.payload;
			})
			break;
		}
		case "SET_HISTORY_ID_ACTION": {
			state = produce(state,draft=>{
				draft.settings.lastHistoryID = action.payload;
			})
			break
		}
		case "SET_LISTENER_ACTION": {
			state = produce(state,draft=>{
				draft.settings.listening = action.payload;
			})
			break;
		}
			
		case "INCREMENT_ACTION_ID_ACTION":{
			state = produce(state, draft => {
				draft.settings.currentID = state.settings.currentID + 1;	
			})
			break;
		}
			// ACTIONS

		case "ADD_REPLY_ACTION_ACTION": {
			state = produce(state, draft => {
				const found = draft.actions.find(a => a.id === action.payload.id);
				if (found) {
					found.playReplies.push(action.payload.reply);					
				}
			})
			break;
		}
		case "TOGGLE_EXPAND_ACTION_ACTION": {
			state = produce(state, draft => {
				const found = draft.actions.find(a => a.id === action.payload.id);
				if (found) {
					found.collapsed = action.payload.expand;		
				}
			})
			break;
		}
			
			// Filter
		case "SET_SEARCH_TERM_ACTION": {
			state = produce(state, draft => {
				draft.filter.searchTerm = action.payload || null;
			})
			break;
		}
		default: {
			if (!(action as any).type.startsWith("@@")) {
				console.error((action as any).type)				
			}
		}
	}
	return state;
};
