import { getInitialState } from "./initialState";
import { TActions } from "../actions/actions";
import produce from "immer"
import { Main } from "../classes/Main";
import { Settings } from "../classes/Settings";

export const appReducer = (state = getInitialState(), action: TActions) => {
	console.log(JSON.stringify(action,null,"\t"));
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
		case "REMOVE_ACTION_ACTION": {
			state = produce(state, draft => {
				let index:number|null = null;
				state.actions.forEach((a, i) => {
					if (a.id === action.payload) {
						index = i;
					}
					return;
				});
				if (typeof index === "number") {
					draft.actions.splice(index, 1);
				}
			})
			break;
		}
		case "APPEND_ACTIONS": {
			state = produce(state, draft => {
				// fix IDs
				action.payload.actions.forEach(action => {
					draft.settings.currentID++;
					action.id = draft.settings.currentID;
				})
				// append on the top
				draft.actions = [
					...action.payload.actions,
					...state.actions,
				]
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
			
		case "SET_FILTER_TYPE": {
			state = produce(state, draft => {
				draft.filter.filterEventsType = action.payload;
			});
			break;
		}
		case "SET_INCLUDE_ACTION":{
			state = produce(state, draft => {
				draft.filter.include = action.payload;
			});
			break;
		}
		case "SET_EXCLUDE_ACTION":{
			state = produce(state, draft => {
				draft.filter.exclude = action.payload;
			});
			break;
		}
		case "GROUP_SAME_ACTION": {
			state = produce(state, draft => {
				draft.filter.groupSame = action.payload;
			});
			break;
		}
		case "REPLACE_WHOLE_STATE": {
			if (action.payload) {
				action.payload.settings.listening = false;
				state = action.payload;				
			}
			break;
		}
		case "FILTER_EVENT_NAME_ACTION": {
			
			state = produce(state, draft => {
				const {kind ,eventName,operation}= action.payload;

				if (operation === "add") {
					if (kind === "include") {
						if (state.filter.include.includes(eventName)) {
							return;
						}
						// remove empty items
						draft.filter.include = draft.filter.include.filter(item => item.trim() !== "");
						draft.filter.include.push(eventName);
					} else if (kind === "exclude") {
						if (state.filter.exclude.includes(eventName)) {
							return;
						}
						// remove empty items
						draft.filter.exclude = draft.filter.exclude.filter(item => item.trim() !== "");
						draft.filter.exclude.push(eventName);
					}					
				} else if (operation === "remove") {
					if (kind === "include") {
						const index = state.filter.include.indexOf(eventName);
						if (index === -1) {
							return
						}
						draft.filter.include.splice(index,1);
					} else if (kind === "exclude") {
						const index = state.filter.exclude.indexOf(eventName);
						if (index === -1) {
							return
						}
						draft.filter.exclude.splice(index,1);
					}
				}
			});
			break;
		}
		default: {
			if (!(action as any).type.startsWith("@@")) {
				console.error((action as any).type)				
			}
		}
	}
	Settings.saveSettings(state);
	return state;
};
