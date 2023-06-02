

import { getInitialState } from "../inspInitialState";
import { TInspectorActions } from "../actions/inspectorActions";
import { IInspectorState } from "../model/types";
import { Settings } from "../classes/Settings";
import { TAtnActions } from "../../atnDecoder/atnActions";
import { atnReducer } from "../../atnDecoder/atnReducer";
import { TSorActions } from "../../sorcerer/sorActions";
import { sorReducer } from "../../sorcerer/sorReducer";
import {inspectorReducer} from "./inspectorReducer";

export type TAllActions = TInspectorActions | TAtnActions|TSorActions;

export const reducer = (state:IInspectorState = Settings.importState() || getInitialState(), action:TAllActions ): IInspectorState => {
	console.log(action/*JSON.stringify(action, null, "\t")*/);

	state = inspectorReducer(state, action as TInspectorActions);
	state = atnReducer(state, action as TAtnActions);
	state = sorReducer(state, action as TSorActions);

	Settings.saveSettings(state);
	return state;
};