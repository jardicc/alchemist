

import produce from "immer";
import { getInitialState } from "../inspInitialState";
import { TActions } from "../actions/inspectorActions";
import { IInspectorState, IContent, IDifference, IDOM, TPath, TCodeViewType, TGenericViewType, TSubTypes } from "../model/types";
import { addMoreKeys } from "../../shared/helpers";
import { Settings } from "../classes/Settings";
import { getDescriptorsListView } from "../selectors/inspectorSelectors";
import { getTreeDomInstance } from "../selectors/inspectorDOMSelectors";
import { TAtnActions } from "../../atnDecoder/atnActions";
import { atnReducer } from "../../atnDecoder/atnReducer";
import { TSorActions } from "../../sorcerer/sorActions";
import { sorReducer } from "../../sorcerer/sorReducer";
import {ListenerClass} from "../classes/Listener";
import {TFilterState} from "../components/FilterButton/FilterButton";
import {TClasses} from "../classes/Reference";

export type TAllActions = TActions | TAtnActions|TSorActions;

export const inspectorReducer = (state:IInspectorState = Settings.importState() || getInitialState(), action:TAllActions ): IInspectorState => {
	console.log(action/*JSON.stringify(action, null, "\t")*/);
	switch (action.type) {
		// ALCHEMIST
		case "SET_MODE_TAB": {
			state = produce(state, draft => {
				draft.inspector.activeTab = action.payload;
			});
			break;
		}
		case "SET_TARGET_REFERENCE": {
			state = produce(state, draft => {

				const type = state.selectedReferenceType;
				
				draft.targetReference[type] = {
					...state.targetReference[type] as any, // TS is not that smart to find a match :-/
					...action.payload,
				};
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
				if (action.payload.replace) {
					draft.descriptors = [action.payload.arg];
				} else {
					draft.descriptors.push(action.payload.arg);					
				}
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
					action.payload.items.forEach(desc => desc.id = crypto.randomUUID());
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
				const { payload: { state: filterState, subType, type } } = action;
				const found = draft.targetReference[type];

				// :-(

				// order matter
				const filterClasses = [
					"filterDoc",
					"filterChannel",
					"filterPath",
					"filterLayer",
					"filterActionSet",
					"filterAction",
					"filterCommand",
					"filterGuide",
					"filterHistory",
					"filterSnapshot",
					"filterProp",
				] as const;

				// order matter
				const classes: TSubTypes[] = [
					"documentID",
					"channelID",
					"pathID",
					"layerID",
					"actionSetID",
					"actionID",
					"commandIndex",
					"guideID",
					"historyID",
					"snapshotID",
					"properties",
				];

				// map object to array based on sorted arrays above
				const map = filterClasses.map((c,index) => ({
					filterClass: c,
					className:classes[index],
					assign: (str: TFilterState) => {
						if (c in found) {
							(found as any)[c] = str;							
						}
					},
				}));

				function disableAllNonMain() {
					map.forEach(item => item.assign("off"));
				}
				
				if (subType === "main") {
					if (filterState === "on") {
						draft.filterBySelectedReferenceType = "off";
					} else {
						draft.filterBySelectedReferenceType = "on";
					}
					disableAllNonMain();
				} else {
					if (filterState === "on") {
						disableAllNonMain();
						draft.filterBySelectedReferenceType = "off";
					} else {
						let foundIndex: number | null = null;
						map.forEach((item, index) => {
							if (item.className === subType) {
								foundIndex = index;
								item.assign("on");
								draft.filterBySelectedReferenceType = "semi";
							} else if (foundIndex === null) {
								item.assign("semi");
							} else {
								item.assign("off");
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
				if (action.payload) {
					ListenerClass.stopInspector();
					ListenerClass.stopSpy();
					draft.settings.autoUpdateInspector = false;
					draft.settings.autoUpdateSpy = false;
				}
			});
			break;
		}
		case "SET_AUTO_INSPECTOR": {
			state = produce(state, draft => {
				draft.settings.autoUpdateInspector = action.payload;
				if (action.payload) {
					ListenerClass.stopListener();
					ListenerClass.stopSpy();
					draft.settings.autoUpdateListener = false;
					draft.settings.autoUpdateSpy = false;
				}
			});
			break;
		}
		case "SET_SPY": {
			state = produce(state, draft => {
				draft.settings.autoUpdateSpy = action.payload;
				if (action.payload) {
					ListenerClass.stopListener();
					ListenerClass.stopInspector();
					draft.settings.autoUpdateListener = false;
					draft.settings.autoUpdateInspector = false;
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
		case "SET_LISTENER_NOTIFIER": {
			state = produce(state, draft => {

				if (state.selectedReferenceType === "listener") {
					draft.settings.listenerFilter = {
						...state.settings.listenerFilter,
						...action.payload.data,
					};					
				} else if (state.selectedReferenceType === "notifier") {
					draft.settings.notifierFilter = {
						...state.settings.notifierFilter,
						...action.payload.data,
					};	
				}

			});
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
		case "TOGGLE_SETTINGS": {
			state = produce(state, draft => {
				draft.settings.settingsVisible = !state.settings.settingsVisible;
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
				if (action.payload.location === "left") {
					draft.settings.leftColumnWidthPx = action.payload.value;					
				} else {
					draft.settings.rightColumnWidthPx = action.payload.value;					
				}
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
				if (action.payload === null) {
					draft.settings.groupDescriptors = state.settings.groupDescriptors === "strict" ? "none" : "strict";					
				} else {
					draft.settings.groupDescriptors = action.payload;					
				}
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
		case "TOGGLE_ACCORDION": {
			state = produce(state, draft => {
				if (action.payload.expanded) {
					if (!state.settings.accordionExpandedIDs.includes(action.payload.id)) {
						draft.settings.accordionExpandedIDs.push(action.payload.id);
					}
				} else {
					if (state.settings.accordionExpandedIDs.includes(action.payload.id)) { 
						draft.settings.accordionExpandedIDs = state.settings.accordionExpandedIDs.filter(id => id !== action.payload.id);
					}
				}
			});
			break;
		}
		case "SET_SEARCH_CONTENT_KEYWORD": {
			state = produce(state, draft => {
				draft.inspector.content.search = action.payload;
			});
			break;
		}
		case "SET_CATEGORY_ITEM_VISIBILITY": {
			state = produce(state, draft => {
				const set = new Set(state.explicitlyVisibleTopCategories);
				if (action.payload.operation === "add") {
					set.add(action.payload.value);					
				} else {
					set.delete(action.payload.value);
				}

				draft.explicitlyVisibleTopCategories = [...set];
			});
			break;
		}
	}

	state = atnReducer(state, action);
	state = sorReducer(state, action);

	Settings.saveSettings(state);
	return state;
};