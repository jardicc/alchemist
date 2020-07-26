
import produce from "immer";
import { getInitialState } from "../store/initialState";
import { TActions } from "../actions/inspectorActions";
import { IInspectorState } from "../model/types";

export const inspectorReducer = (state = getInitialState(), action: TActions): IInspectorState => {
	console.log(JSON.stringify(action, null, "\t"));
	switch (action.type) {
		case "SET_MAIN_TAB": {
			state = produce(state, draft => {
				draft.activeSection = action.payload;
			});
			break;
		}
		case "SET_MODE_TAB": {
			state = produce(state, draft => {
				draft.inspector.activeTab = action.payload;
			});
			break;
		}
		case "SET_TARGET_REFERENCE": {
			state = produce(state, draft => {
				const found = draft.targetReference.find(r => action.payload.type === r.type);
				if (found) {
					found.data = action.payload.data;
				}
			});
			break;
		}
		case "ADD_DESCRIPTOR": {
			state = produce(state, draft => {
				draft.descriptors.unshift(action.payload);
			});
			break;
		}
		case "SELECT_DESCRIPTOR": {
			state = produce(state, draft => {
				const { operation, uuid } = action.payload;
				if (operation === "replace") {
					draft.descriptors.forEach(d => d.selected = false);
				}
				const found = draft.descriptors.find(d => d.id === uuid);
				if (found) {
					if (operation === "add" || operation === "replace") {
						found.selected = true;
					} else if (operation === "subtract") {
						found.selected = false;
					}
				}
			});
			break;
		}
		case "SET_SELECTED_REFERENCE_TYPE_ACTION": {
			state = produce(state, draft => {
				draft.selectedReferenceType = action.payload;
			});
			break;
		}
		case "CLEAR_VIEW": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		case "CLEAR": {
			state = produce(state, draft => {
				draft.descriptors = draft.descriptors.filter(d => d.locked) || [];
			});
			break;
		}
		case "CLEAR_NON_EXISTENT": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		case "LOCK_DESC": {
			state = produce(state, draft => {
				draft.descriptors.filter(d => action.payload.uuids.includes(d.id)).forEach(d => d.locked = action.payload.lock);
			});
			break;
		}
		case "PIN_DESC": {
			state = produce(state, draft => {
				draft.descriptors.filter(d => action.payload.uuids.includes(d.id)).forEach(d => d.pinned = action.payload.pin);
			});
			break;
		}
		case "REMOVE_DESC": {
			state = produce(state, draft => {
				draft.descriptors = draft.descriptors.filter(d => (action.payload.includes(d.id) === false || d.locked));
			});
			break;
		}
		case "SET_INSPECTOR_PATH_DIFF": {
			state = produce(state, draft => {
				if (action.payload.mode === "add") {
					draft.inspector.difference.treePath = [...state.inspector.difference.treePath, ...action.payload.path];					
				} else if (action.payload.mode === "replace") {
					draft.inspector.difference.treePath = action.payload.path;
				}
			});
			break;
		}
		case "SET_INSPECTOR_PATH_CONTENT": {
			state = produce(state, draft => {
				if (action.payload.mode === "add") {
					draft.inspector.content.treePath = [...state.inspector.content.treePath, ...action.payload.path];					
				} else if (action.payload.mode === "replace") {
					draft.inspector.content.treePath = action.payload.path;
				}
			});
			break;
		}
		case "SET_INSPECTOR_PATH_DOM": {
			state = produce(state, draft => {
				if (action.payload.mode === "add") {
					draft.inspector.dom.treePath = [...state.inspector.dom.treePath, ...action.payload.path];					
				} else if (action.payload.mode === "replace") {
					draft.inspector.dom.treePath = action.payload.path;
				}
			});
			break;
		}
		case "IMPORT_STATE": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		case "IMPORT_APPEND": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		case "IMPORT_REPLACE": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		case "EXPORT_SELECTED_DESC": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		case "EXPORT_ALL_DESC": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		case "EXPORT_STATE": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		case "SET_FILTER_STATE": {
			state = produce(state, draft => {
				const { payload: { state, subType, type } } = action;
				const found = draft.targetReference.find(r => r.type === type);

				if (subType === "main") {
					if (state === "on") {
						draft.filterBySelectedReferenceType = "off";
					} else {
						draft.filterBySelectedReferenceType = "on";
					}
					found?.data.forEach(d => d.content.filterBy = "off");
				} else {
					if (state === "on") {
						found?.data.forEach(d => d.content.filterBy = "off");
						draft.filterBySelectedReferenceType = "off";
					} else {
						let foundIndex: number | null = null;
						found?.data.forEach((d, i) => {
							if (d.subType === subType) {
								foundIndex = i;
								d.content.filterBy = "on";
								draft.filterBySelectedReferenceType = "semi";
							} else if (foundIndex === null) {
								d.content.filterBy = "semi";
							} else {
								d.content.filterBy = "off";
							}
						});
					}
				}
			});
			break;
		}
		//Settings.saveSettings(state);
	}
	return state;
};