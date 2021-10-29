// maybe TODO

/*
import produce from "immer";
import { getInitialState } from "../store/initialState";


export const inspectorReducer = (state = getInitialState(), action: TActions): IInspectorState => {
	console.log(JSON.stringify(action, null, "\t"));
	switch (action.type) {
		case "SET_MAIN_TAB": {
			state = produce(state, draft => {
				draft.activeSection = action.payload;
			});
			break;
		}
	}
	Settings.saveSettings(state);
	return state;
};

*/