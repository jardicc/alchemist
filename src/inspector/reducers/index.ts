
import produce from "immer";
import { getInitialState } from "../store/initialState";
import { TActions } from "../actions/inspectorActions";
import { IInspectorState, IContent, IDifference, IReference, IDOM, TPath } from "../model/types";
import { GetInfo } from "../classes/GetInfo";
import { addMoreKeys } from "../../shared/helpers";
import { getTreeDomInstance, getDescriptorsListView } from "../selectors/inspectorSelectors";
import { Settings } from "../../listener/classes/Settings";

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
					} else if (operation === "addContinuous" || operation === "subtractContinuous") {
						const view = getDescriptorsListView({inspector:state});
						const lastSelectedItemIndex = view.map(item => item.id).indexOf(state.settings.lastSelectedItem ?? "n/a");
						const thisItemIndex = view.map(item => item.id).indexOf(uuid);
						if (lastSelectedItemIndex !== -1 && thisItemIndex !== -1) {
							const ids:string[] = [];
							for (let i = Math.min(lastSelectedItemIndex, thisItemIndex), end = Math.max(lastSelectedItemIndex, thisItemIndex); i <= end; i++){
								ids.push(view[i].id);
							}
							ids.forEach(id => {
								const f = draft.descriptors.find(item => item.id === id);
								if (f) { f.selected = operation === "addContinuous";}
							});
						}
					}
				}

				//
				draft.settings.lastSelectedItem = uuid;
				draft.inspector.content.expandedTree = [];
				draft.inspector.dom.expandedTree = [];
				draft.inspector.difference.expandedTree = [];
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
				const view = getDescriptorsListView({ inspector: state});
				const ids = view.filter(item => !item.locked).map(item => item.id);
				draft.descriptors = state.descriptors.filter(item => {
					if (action.payload.keep) {
						return ids.includes(item.id);
					} else {
						return !ids.includes(item.id);						
					}
				}
				);
			});
			break;
		}
		case "CLEAR": {
			state = produce(state, draft => {
				draft.descriptors = draft.descriptors.filter(d => d.locked) || [];
				draft.inspector = getInitialState().inspector;
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
				//
				draft.inspector.content.expandedTree = [];
				draft.inspector.dom.expandedTree = [];
				draft.inspector.difference.expandedTree = [];
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
			state = {
				...action.payload.inspector
			};
			break;
		}
		case "IMPORT_ITEMS": {
			state = produce(state, draft => {
				if (action.payload.kind === "append") {
					draft.descriptors = [...action.payload.items, ...state.descriptors];
				} else if (action.payload.kind === "replace") {
					draft.descriptors = action.payload.items;
				}
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
		case "SET_LISTENER": {
			state = produce(state, draft => {
				draft.settings.autoUpdateListener = action.payload;
			});
			break;
		}
		case "SET_AUTO_INSPECTOR": {
			state = produce(state, draft => {
				draft.settings.autoUpdateInspector = action.payload;
			});
			break;
		}
		case "SET_EXPANDED_PATH": {
			state = produce(state, draft => {
				const { expand, path, recursive, type } = action.payload;
				let { data } = action.payload;

				// gets port of the tree data where you clicked
				function getDataPart(d: any, tPath:TPath|undefined): any {
					if (!tPath) {
						return d;
					}
					let sub = d;
					for (const part of tPath) {
						sub = (sub)?.[part];
					}
					return sub;
				}

				// prevents callstack exceeded error
				function isCyclical(tPath: TPath, toTest: any): boolean{
					let sub = data;
					tPath = [...path,...tPath];
					tPath.splice(tPath.length - 1, 1);
					for (const part of tPath) {
						sub = (sub)?.[part];
						if (sub === toTest) {
							return true;
						}
					}
					return false;
				}

				// generates paths for all expandable item in passed object
				function generatePaths(d: any): TPath[]{
					const paths: TPath[] = [];
					traverse(d);
					return paths;
					
					// recursion
					function traverse(d: any, tPath: TPath = []): void{
						if (d && typeof d === "object" && !isCyclical(tPath,d)) {
							paths.push([...path, ...tPath]);
							const keys = Object.keys(d);
							if (type === "dom") {
								keys.push(...addMoreKeys("uxp", d));
								keys.sort();
							}
							for (const key of keys) {
								traverse(d[key],[...tPath,key]);
							}
						}
					}					
				}
				
				let draftPart: IContent | IDifference | IDOM | null = null;

				switch (type) {
					case "content": draftPart = draft.inspector.content; break;
					case "difference": draftPart = draft.inspector.difference; break;
					case "dom": draftPart = draft.inspector.dom; break;
					default: console.warn("You shouldn't see this line logged in console");
				}

				if (type === "dom") {		
					data = getTreeDomInstance({ inspector: state});
				}

				if (draftPart) { 
					let index:number|null = null;
					const found = draftPart.expandedTree.find((item, i) => {
						index = i;
						return item.join("-") === path.join("-");
					});
					if (expand && !found) {
						if (recursive) {
							const parts = generatePaths(getDataPart(data, path));//.map(p=>([...path,...p]));
							draftPart.expandedTree.push(...parts);
						} else {
							draftPart.expandedTree.push(path);									
						}
						
					} else if ((found || recursive) && index !== null) {
						if (recursive) {
							const parts = generatePaths(getDataPart(data, path));//.map(p => ([...path,...p,]));
							for (const part of parts) {
								let index: number | null = null;
								const partStr = part.join("-");
								const found = draftPart.expandedTree.find((item, i) => {
									index = i;
									return item.join("-") === partStr;
								});
								if (found && index !== null) {
									draftPart.expandedTree.splice(index, 1);
								}
							}
						} else {
							draftPart.expandedTree.splice(index, 1);								
						}
					}
				}
			});
			console.log(state.inspector);
			break;
		}
		case "SET_SEARCH_TERM_ACTION": {
			state = produce(state, draft => {
				draft.settings.searchTerm = action.payload;
			});
			break;
		}
		case "SET_FILTER_TYPE": {
			state = produce(state, draft => {
				draft.settings.listenerFilterType = action.payload;
			});
			break;
		}
		case "SET_INCLUDE_ACTION": {
			state = produce(state, draft => {
				draft.settings.listenerInclude = action.payload;
			});
			break;
		}
		case "SET_EXCLUDE_ACTION": {
			state = produce(state, draft => {
				draft.settings.listenerExclude = action.payload;
			});
			break;
		}
		case "GROUP_SAME_ACTION": {
			state = produce(state, draft => {
				draft.settings.groupDescriptors = action.payload ? "strict":"none";
			});
			break;
		}
		case "REPLACE_WHOLE_STATE": {
			if (action.payload) {
				action.payload.settings.autoUpdateListener = false;
				action.payload.settings.autoUpdateInspector = false;
				state = action.payload;				
			}
			break;
		}
	}
	Settings.saveSettings(state);
	return state;
};