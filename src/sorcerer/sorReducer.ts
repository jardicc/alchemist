import produce from "immer";
import { IInspectorState } from "../inspector/model/types";
import { TAllActions } from "../inspector/reducers/reducer";
import { makeSorCommand, makeSorPanel, makeSorSnippet } from "./sorInitialState";

export const sorReducer = (state: IInspectorState, action: TAllActions): IInspectorState => {
	switch (action.type) {
		case "[SOR] SELECT": {
			state = produce(state, draft => {
				draft.sorcerer.selectedItem = {
					kind: action.payload.type,
					uuid: action.payload.uuid,
				};
			});
			break;
		}
		case "[SOR] MAKE": {
			state = produce(state, draft => {
				switch (action.payload.type) {
					case "command": {
						const data = makeSorCommand();
						draft.sorcerer.manifestInfo.entrypoints.push(data);
						break;
					}
					case "panel": {
						const data = makeSorPanel();						
						draft.sorcerer.manifestInfo.entrypoints.push(data);
						break;
					}
					case "snippet": {
						const data = makeSorSnippet();						
						draft.sorcerer.snippets.list.push(data);
						break;
					}
				}
			});
			break;
		}
		case "[SOR] REMOVE": {
			state = produce(state, draft => {
				switch (action.payload.type) {
					case "panel":
					case "command": {
						const index = draft.sorcerer.manifestInfo.entrypoints.findIndex(item => item.$$$uuid === action.payload.uuid);
						if (index !== -1) {
							draft.sorcerer.manifestInfo.entrypoints.splice(index, 1);
						}
						break;
					}
					case "snippet": {
						const index = draft.sorcerer.snippets.list.findIndex(item => item.$$$uuid === action.payload.uuid);
						if (index !== -1) {
							draft.sorcerer.snippets.list.splice(index, 1);
						}
						break;
					}
				}
			});
			break;
		}
	}

	return state;
};

