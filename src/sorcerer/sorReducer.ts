import produce from "immer";
import { Helpers } from "../inspector/classes/Helpers";
import { IInspectorState } from "../inspector/model/types";
import { TAllActions } from "../inspector/reducers/reducer";
import { makeSorCommand, makeSorPanel, makeSorSnippet } from "./sorInitialState";
import { IEntrypointPanel } from "./sorModel";

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
						//data.$$$uuid = Helpers.uuidv4();
						draft.sorcerer.manifestInfo.entrypoints.push(data);
						break;
					}
					case "panel": {
						const data = makeSorPanel();						
						//data.$$$uuid = Helpers.uuidv4();
						draft.sorcerer.manifestInfo.entrypoints.push(data);
						break;
					}
					case "snippet": {
						const data = makeSorSnippet();						
						//data.$$$uuid = Helpers.uuidCustom();
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
				draft.sorcerer.selectedItem.kind = "general";
				draft.sorcerer.selectedItem.uuid = null;
			});
			break;
		}
		case "[SOR] SET_MAIN":{
			state = produce(state, draft => {				
				draft.sorcerer.manifestInfo = {
					...state.sorcerer.manifestInfo,
					...action.payload,
				};				
			});
			break;
		}
		case "[SOR] SET_PANEL":{
			state = produce(state, draft => {				
				const index = draft.sorcerer.manifestInfo.entrypoints.findIndex(e => e.type === "panel" && e.$$$uuid === action.payload.uuid);
				if (index!==-1) {
					draft.sorcerer.manifestInfo.entrypoints[index] = {
						...state.sorcerer.manifestInfo.entrypoints[index],
						...action.payload.value,
					};
				}
			});		
			break;
		}
		case "[SOR] SET_SNIPPET":{
			state = produce(state, draft => {				
				const index = draft.sorcerer.snippets.list.findIndex(e => e.$$$uuid === action.payload.uuid);
				if (index!==-1) {
					draft.sorcerer.snippets.list[index] = {
						...state.sorcerer.snippets.list[index],
						...action.payload.value,
					};
				}
			});		
			break;
		}
		case "[SOR] SET_COMMAND":{
			state = produce(state, draft => {				
				const index = draft.sorcerer.manifestInfo.entrypoints.findIndex(e => e.type === "command" && e.$$$uuid === action.payload.uuid);
				if (index!==-1) {
					draft.sorcerer.manifestInfo.entrypoints[index] = {
						...state.sorcerer.manifestInfo.entrypoints[index],
						...action.payload.value,
					};
				}
			});		
			break;
		}
		case "[SOR] ASSIGN_SNIPPET_TO_PANEL": {
			state = produce(state, draft => {
				const { operation, uuid,snippetUuid } = action.payload;
				//debugger;

				const index = state.sorcerer.manifestInfo.entrypoints.findIndex(entryPoint => entryPoint.type === "panel" && entryPoint.$$$uuid === uuid);

				if (index !== -1) {
					const found: IEntrypointPanel = draft.sorcerer.manifestInfo.entrypoints[index] as IEntrypointPanel;
					const foundState: IEntrypointPanel = state.sorcerer.manifestInfo.entrypoints[index] as IEntrypointPanel;

					if (operation === "on") {
						if (!foundState.$$$snippetUUIDs.includes(snippetUuid)) {
							found.$$$snippetUUIDs.push(snippetUuid);
						}
					} else if (operation === "off") {
						const index = foundState.$$$snippetUUIDs.indexOf(snippetUuid);
						if (index !== -1) {
							found.$$$snippetUUIDs.splice(index, 1);
						}
					}
				}
			});
			break;
		}
		case "[SOR] SET_HOST_APP": {
			state = produce(state, draft => {
				const found = draft.sorcerer.manifestInfo.host.find(host => host.app === action.payload.app);
				if (found) {
					Object.assign(found, action.payload.arg);
				}
			});
			break;
		}
		case "[SOR] SET_PRESET": {
			state = produce(state, draft => {
				draft.sorcerer = action.payload;
			});
			break;
		}
	}

	return state;
};

