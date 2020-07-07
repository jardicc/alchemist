
import produce from "immer";
import { getInitialState, IInspectorState } from "./initialStateInspector";
import { TActions } from "../actions/inspectorActions";

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
				draft.descriptors.push(action.payload);
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
		//Settings.saveSettings(state);
	}
	return state;
};