

import produce from "immer";
import { getInitialState } from "../store/initialState";
import { TActions } from "../actions/inspectorActions";
import { IInspectorState, IContent, IDifference, IDOM, TPath, TCodeViewType, TGenericViewType } from "../model/types";
import { GetInfo } from "../classes/GetInfo";
import { addMoreKeys } from "../../shared/helpers";
import { Settings } from "../classes/Settings";
import { getDescriptorsListView } from "../selectors/inspectorSelectors";
import { getTreeDomInstance } from "../selectors/inspectorDOMSelectors";
import { cloneDeep } from "lodash";
import { TAtnActions } from "../../atnDecoder/actions/atnActions";
import { selectedCommands } from "../../atnDecoder/selectors/atnSelectors";


export const inspectorReducer = (state = getInitialState(), action: TActions | TAtnActions): IInspectorState => {
	console.log(JSON.stringify(action, null, "\t"));
	switch (action.type) {
		// OCCULTIST
		case "[ATN] CLEAR_ALL": {
			state = produce(state, draft => {
				draft.atnConverter.data = [];
			});
			break;
		}
		case "[ATN] SET_DATA": {
			state = produce(state, draft => {
				draft.atnConverter.data.push(action.payload);
			});
			break;
		}
			
		case "[ATN] EXPAND_ACTION": {
			state = produce(state, draft => {

				const indexOf = draft.atnConverter.expandedItems.findIndex(item => {
					if (item.length !== action.payload.uuid.length) {
						return false;
					}
					const res = (item[0] === action.payload.uuid[0] && item[1] === action.payload.uuid[1]);
					return res;
				});

				if (action.payload.expand) {
					if (indexOf === -1) {
						draft.atnConverter.expandedItems.push(action.payload.uuid);
					}
				} else {
					if (indexOf !== -1) {
						draft.atnConverter.expandedItems.splice(indexOf, 1);
					}
				}
			});
			break;
		}
			
		case "[ATN] SELECT_ACTION": {
			state = produce(state, draft => {
				const { operation, uuid } = action.payload;
				if (operation === "none") {
					draft.atnConverter.selectedItems = [];
				} else if (operation === "replace") {
					draft.atnConverter.selectedItems = [action.payload.uuid];
				}

				/*

				const found = draft.descriptors.find(d => d.id === uuid);
				if (found && operation !== "none") {					
					if (operation === "add" || operation === "replace") {
						found.selected = true;
					} else if (operation === "subtract") {
						found.selected = false;
					} else if (operation === "addContinuous" || operation === "subtractContinuous") {
						const view = getDescriptorsListView({inspector:state});
						const lastSelectedItemIndex = view.map(item => item.id).indexOf(state.settings.lastSelectedItem ?? "n/a");
						const thisItemIndex = view.map(item => item.id).indexOf(uuid as string);
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
				*/
				//
				draft.atnConverter.lastSelected = uuid || getInitialState().atnConverter.lastSelected;
			});
			break;
		}
		/*
		case "[ATN] PASS_SELECTED": {
			state = produce(state, draft => {
				const commands = selectedCommands({ inspector: state });
				

			});
			break;
		}
			*/
		// ALCHEMIST
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
				if (state.descriptors.length >= state.settings.maximumItems) {
					for (let i = 0; i<draft.descriptors.length; i++){
						if (!draft.descriptors[i].locked) {
							// in case that we downsized limit and more than 1 item has to be removed
							if (draft.descriptors.length < state.settings.maximumItems) {
								break;								
							}
							draft.descriptors.splice(i, 1);
						}
					}
				}
				draft.descriptors.push(action.payload);
			});
			break;
		}
		case "SELECT_DESCRIPTOR": {
			state = produce(state, draft => {
				const { operation, uuid } = action.payload;
				if (operation === "none") {
					draft.descriptors.forEach(d => d.selected = false);
				} else if (operation === "replace") {
					draft.descriptors.forEach(d => d.selected = false);
				}

				const found = draft.descriptors.find(d => d.id === uuid);
				if (found && operation !== "none") {					
					if (operation === "add" || operation === "replace") {
						found.selected = true;
					} else if (operation === "subtract") {
						found.selected = false;
					} else if (operation === "addContinuous" || operation === "subtractContinuous") {
						const view = getDescriptorsListView({inspector:state});
						const lastSelectedItemIndex = view.map(item => item.id).indexOf(state.settings.lastSelectedItem ?? "n/a");
						const thisItemIndex = view.map(item => item.id).indexOf(uuid as string);
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
				draft.settings.lastSelectedItem = uuid || getInitialState().settings.lastSelectedItem;
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
				},
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
		/*
		case "CLEAR_NON_EXISTENT": {
			state = produce(state, draft => {
				console.log("empty");
			});
			break;
		}
		*/
		case "LOCK_DESC": {
			state = produce(state, draft => {
				if (state.settings.groupDescriptors === "strict") {
					const selectedByID = state.descriptors.filter(d => (action.payload.uuids.includes(d.id)));
					const crcs = Array.from(new Set(selectedByID.map(d => d.crc)));
					
					draft.descriptors.filter(d => crcs.includes(d.crc)).forEach(d => d.locked = action.payload.lock);
				} else if (state.settings.groupDescriptors === "none") {
					draft.descriptors.filter(d => action.payload.uuids.includes(d.id)).forEach(d => d.locked = action.payload.lock);
				}
			});
			break;
		}
		case "PIN_DESC": {
			state = produce(state, draft => {

				if (state.settings.groupDescriptors === "strict") {
					const selectedByID = state.descriptors.filter(d => (action.payload.uuids.includes(d.id)));
					const crcs = Array.from(new Set(selectedByID.map(d => d.crc)));
					
					draft.descriptors.filter(d => crcs.includes(d.crc)).forEach(d => d.pinned = action.payload.pin);
				} else if (state.settings.groupDescriptors === "none") {
					draft.descriptors.filter(d => action.payload.uuids.includes(d.id)).forEach(d => d.pinned = action.payload.pin);
				}
			});
			break;
		}
		case "REMOVE_DESC": {
			state = produce(state, draft => {

				if (state.settings.groupDescriptors === "strict") {
					const selectedByID = state.descriptors.filter(d => (action.payload.includes(d.id) && !d.locked));
					// remove by crc instead of ID. 
					const crcs = Array.from(new Set(selectedByID.map(d => d.crc)));
					draft.descriptors = state.descriptors.filter(d => (crcs.includes(d.crc) === false || d.locked));

				} else if (state.settings.groupDescriptors === "none") {
					draft.descriptors = state.descriptors.filter(d => (action.payload.includes(d.id) === false || d.locked));
				}
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
				...action.payload.inspector,
			};
			break;
		}
		case "IMPORT_ITEMS": {
			state = produce(state, draft => {
				if (action.payload.kind === "append") {
					action.payload.items.forEach(desc => desc.id = GetInfo.uuidv4());
					draft.descriptors = [...state.descriptors,...action.payload.items];
				} else if (action.payload.kind === "replace") {
					draft.descriptors = action.payload.items;
				}
			});
			break;
		}
		/*
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
		*/
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
		case "REPLACE_WHOLE_STATE": {
			if (action.payload &&
				getInitialState().version[0] === action.payload.version[0] // load only compatible version
			) {
				action.payload.settings.autoUpdateListener = false;
				action.payload.settings.autoUpdateInspector = false;
				action.payload.amConvertor = cloneDeep(state.amConvertor);
				state = action.payload;				
			}
			break;
		}
		case "SET_DISPATCHER_VALUE": {
			state = produce(state, draft => {
				draft.dispatcher.snippets[0].content = action.payload;
			});
			break;
		}
		case "RENAME_DESCRIPTOR": {
			state = produce(state, draft => {
				const found = draft.descriptors.find(desc => desc.id === action.payload.uuid);
				if (found) {
					found.title = action.payload.name;
				}
			});
			break;
		}
		case "SET_RENAME_MODE": {
			state = produce(state, draft => {
				const found = draft.descriptors.find(desc => desc.id === action.payload.uuid);
				if (found) {
					found.renameMode = action.payload.on;
				}
			});
			break;
		}
		case "SET_DESCRIPTOR_OPTIONS": {
			state = produce(state, draft => {
				if (action.payload.uuids === "default") {
					draft.settings.initialDescriptorSettings = {
						...state.settings.initialDescriptorSettings,
						...action.payload.options,
					};
				} else {
					for (let i = 0, len = action.payload.uuids.length; i < len; i++){
						let foundIndex = 0;
						const found = draft.descriptors.find((desc, j) => {
							foundIndex = j;
							return desc.id === action.payload.uuids[i];
						});
						if (found) {
							found.descriptorSettings = {
								...state.descriptors[foundIndex].descriptorSettings,
								...action.payload.options,
							};
						}
					}
				}
			});
			break;	
		}
		case "SET_INSPECTOR_VIEW_ACTION": {
			state = produce(state, draft => {
				const {inspectorType,viewType } = action.payload;

				switch (inspectorType) {
					case "code":
						draft.inspector.code.viewType = viewType as TCodeViewType;
						break;
					case "content":
						draft.inspector.content.viewType = viewType as TGenericViewType;
						break;
					case "diff":
						draft.inspector.difference.viewType = viewType as TGenericViewType;
						break;
				}
			});
			break;
		}
		case "SET_COLUMN_SIZE_ACTION": {
			state = produce(state, draft => {
				draft.settings.leftColumnWidthPx = action.payload;
			});
			break;
		}
		case "SET_RECORD_RAW": {
			state = produce(state, draft => {
				draft.settings.makeRawDataEasyToInspect = action.payload;
			});
			break;
		}
		case "SET_AUTOEXPAND_LEVEL": {
			state = produce(state, draft => {
				switch (action.payload.part) {
					case "DOM": {
						draft.inspector.dom.autoExpandLevels = action.payload.level;
						break;
					}
					case "content": {
						draft.inspector.content.autoExpandLevels = action.payload.level;
						break;
					}
					case "diff": {
						draft.inspector.difference.autoExpandLevels = action.payload.level;
						break;
					}
				}
			});
			break;
		}
		case "SET_MAXIMUM_ITEMS": {
			state = produce(state, draft => {
				let num = parseInt(action.payload);
				if (num < 3 || Number.isNaN(num)) {
					num = 3;
				}
				draft.settings.maximumItems = num;
			});
			break;
		}
		case "DONT_SHOW_MARKETPLACE_INFO_ACTION": {
			state = produce(state, draft => {
				draft.settings.dontShowMarketplaceInfo = action.payload;
			});
			break;
		}
		case "SET_CONVERTER": {
			state = produce(state, draft => {
				draft.amConvertor = {
					...state.amConvertor,
					...action.payload,
				};
			});
			break;
		}
		case "SET_FONT_SIZE": {
			state = produce(state, draft => {
				draft.settings.fontSize = action.payload;
			});
			break;
		}
		case "SET_NEVER_RECORD_ACTION_NAMES_ACTION": {
			state = produce(state, draft => {
				draft.settings.neverRecordActionNames = action.payload;
			});
			break;
		}
		case "TOGGLE_DESCRIPTORS_GROUPING": {
			state = produce(state, draft => {
				draft.settings.groupDescriptors = state.settings.groupDescriptors === "strict" ? "none" : "strict";
			});
			break;
		}
		case "SET_SETTINGS": {
			state = produce(state, draft => {
				draft.settings = {
					...state.settings,
					...action.payload,
				};
			});
			break;
		}
	}
	Settings.saveSettings(state);
	return state;
};