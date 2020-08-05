
import produce from "immer";
import { getInitialState } from "../store/initialState";
import { TActions } from "../actions/inspectorActions";
import { IInspectorState, IContent, IDifference, IReference, IDOM, TPath } from "../model/types";
import { GetInfo } from "../classes/GetInfo";
import { addMoreKeys } from "../../shared/helpers";
import { getTreeDomInstance } from "../selectors/inspectorSelectors";

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

				//
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
				console.log("empty");
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
					data = getTreeDomInstance({ inspector: state, listener: {} as any });
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
		//Settings.saveSettings(state);
	}
	return state;
};