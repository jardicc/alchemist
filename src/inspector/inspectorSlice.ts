import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {
	TActiveInspectorTab, IDescriptor, TTargetReference, TSelectDescriptorOperation, TSubTypes,
	ITreeDataTabs, TImportItems, IInspectorState, TGenericViewType,
	TCodeViewType, TFontSizeSettings, IDescriptorSettings, ISettings, IListenerNotifierFilter, TAllTargetReferences,
	IContent, IDifference, IDOM,
} from "./model/types";
import {TFilterState} from "./components/FilterButton";
import {KeyPath} from "./components/react-json-tree-2/types";
import {getInitialState} from "./inspInitialState";
import {Settings} from "./classes/Settings";
import {addMoreKeys} from "../shared/helpers";
import type {IRootState} from "../shared/store";

// Lazy accessors to break circular imports between this slice and modules
// that transitively depend on the root store (Listener -> Main -> store).
const getListenerClass = (): typeof import("./classes/Listener").ListenerClass =>
	require("./classes/Listener").ListenerClass;
const getDescriptorsListViewLazy = (): typeof import("./selectors/inspectorSelectors").getDescriptorsListView =>
	require("./selectors/inspectorSelectors").getDescriptorsListView;
const getTreeDomInstanceLazy = (): typeof import("./selectors/inspectorDOMSelectors").getTreeDomInstance =>
	require("./selectors/inspectorDOMSelectors").getTreeDomInstance;

// NOTE: the real initial state is computed lazily by the combined
// `inspectorReducer` (see ./reducers/reducer.ts). We pass an empty placeholder
// here because `createSlice` requires a value, but matching the original
// behavior (lazy `Settings.importState() || getInitialState()`) is essential
// to avoid evaluating photoshop-dependent helpers at module-load time.
const initialInspectorState = {} as IInspectorState;

export const inspectorSlice = createSlice({
	name: "inspector",
	initialState: initialInspectorState,
	reducers: {
		setModeTab(state, action: PayloadAction<TActiveInspectorTab>) {
			state.inspector.activeTab = action.payload;
		},
		setTargetReference(state, action: PayloadAction<Partial<TAllTargetReferences>>) {
			const type = state.selectedReferenceType;
			state.targetReference[type] = {
				...state.targetReference[type] as any,
				...action.payload,
			};
		},
		addDescriptor: {
			reducer(state, action: PayloadAction<{arg: IDescriptor; replace: boolean}>) {
				if (state.descriptors.length >= state.settings.maximumItems) {
					for (let i = 0; i < state.descriptors.length; i++) {
						if (!state.descriptors[i].locked) {
							if (state.descriptors.length < state.settings.maximumItems) {
								break;
							}
							state.descriptors.splice(i, 1);
						}
					}
				}
				if (action.payload.replace) {
					state.descriptors = [action.payload.arg];
				} else {
					state.descriptors.push(action.payload.arg);
				}
			},
			prepare(arg: IDescriptor, replace: boolean) {
				return {payload: {arg, replace}};
			},
		},
		selectDescriptor: {
			reducer(state, action: PayloadAction<{operation: TSelectDescriptorOperation; uuid?: string; crc?: number}>) {
				const {operation, uuid} = action.payload;
				if (operation === "none" || operation === "replace") {
					state.descriptors.forEach(d => d.selected = false);
				}

				const found = state.descriptors.find(d => d.id === uuid);
				if (found && operation !== "none") {
					if (operation === "add" || operation === "replace") {
						found.selected = true;
					} else if (operation === "subtract") {
						found.selected = false;
					} else if (operation === "addContinuous" || operation === "subtractContinuous") {
						const view = getDescriptorsListViewLazy()({inspector: state});
						const lastSelectedItemIndex = view.map(item => item.id).indexOf(state.settings.lastSelectedItem ?? "n/a");
						const thisItemIndex = view.map(item => item.id).indexOf(uuid!);
						if (lastSelectedItemIndex !== -1 && thisItemIndex !== -1) {
							const ids: string[] = [];
							for (let i = Math.min(lastSelectedItemIndex, thisItemIndex), end = Math.max(lastSelectedItemIndex, thisItemIndex); i <= end; i++) {
								ids.push(view[i].id);
							}
							ids.forEach(id => {
								const f = state.descriptors.find(item => item.id === id);
								if (f) {f.selected = operation === "addContinuous";}
							});
						}
					}
				}

				state.settings.lastSelectedItem = uuid || getInitialState().settings.lastSelectedItem;
				state.inspector.content.expandedTree = [];
				state.inspector.dom.expandedTree = [];
				state.inspector.difference.expandedTree = [];
			},
			prepare(operation: TSelectDescriptorOperation, uuid?: string, crc?: number) {
				return {payload: {operation, uuid, crc}};
			},
		},
		setSelectedReferenceType(state, action: PayloadAction<TTargetReference>) {
			state.selectedReferenceType = action.payload;
		},
		setProperty: {
			reducer(state, action: PayloadAction<{value: string | number; toggle?: boolean}>) {
				const {value, toggle} = action.payload;
				const activeRef = state.targetReference[state.selectedReferenceType];
				if ("properties" in activeRef && typeof value === "string") {
					if (toggle) {
						const foundIndex = activeRef.properties.indexOf(value);
						if (foundIndex === -1) {
							activeRef.properties.push(value);
						} else {
							activeRef.properties.splice(foundIndex, 1);
						}
					} else {
						activeRef.properties = [value];
					}
				}
			},
			prepare(value: string | number, toggle: boolean) {
				return {payload: {value, toggle}};
			},
		},
		clearView: {
			reducer(state, action: PayloadAction<{keep: boolean}>) {
				const view = getDescriptorsListViewLazy()({inspector: state});
				const ids = view.filter(item => !item.locked).map(item => item.id);
				state.descriptors = state.descriptors.filter(item => {
					if (action.payload.keep) {
						return ids.includes(item.id);
					} else {
						return !ids.includes(item.id);
					}
				});
			},
			prepare(keep: boolean) {
				return {payload: {keep}};
			},
		},
		clear(state) {
			state.descriptors = state.descriptors.filter(d => d.locked) || [];
			state.inspector = getInitialState().inspector;
		},
		clearNonExistent: {
			reducer() {/* noop in reducer */},
			prepare() {return {payload: null};},
		},
		lockDesc: {
			reducer(state, action: PayloadAction<{lock: boolean; uuids: string[]}>) {
				if (state.settings.groupDescriptors === "strict") {
					const selectedByID = state.descriptors.filter(d => action.payload.uuids.includes(d.id));
					const crcs = Array.from(new Set(selectedByID.map(d => d.crc)));
					state.descriptors.filter(d => crcs.includes(d.crc)).forEach(d => d.locked = action.payload.lock);
				} else if (state.settings.groupDescriptors === "none") {
					state.descriptors.filter(d => action.payload.uuids.includes(d.id)).forEach(d => d.locked = action.payload.lock);
				}
			},
			prepare(lock: boolean, uuids: string[]) {
				return {payload: {uuids, lock}};
			},
		},
		pinDesc: {
			reducer(state, action: PayloadAction<{pin: boolean; uuids: string[]}>) {
				if (state.settings.groupDescriptors === "strict") {
					const selectedByID = state.descriptors.filter(d => action.payload.uuids.includes(d.id));
					const crcs = Array.from(new Set(selectedByID.map(d => d.crc)));
					state.descriptors.filter(d => crcs.includes(d.crc)).forEach(d => d.pinned = action.payload.pin);
				} else if (state.settings.groupDescriptors === "none") {
					state.descriptors.filter(d => action.payload.uuids.includes(d.id)).forEach(d => d.pinned = action.payload.pin);
				}
			},
			prepare(pin: boolean, uuids: string[]) {
				return {payload: {uuids, pin}};
			},
		},
		removeDesc(state, action: PayloadAction<string[]>) {
			if (state.settings.groupDescriptors === "strict") {
				const selectedByID = state.descriptors.filter(d => action.payload.includes(d.id) && !d.locked);
				const crcs = Array.from(new Set(selectedByID.map(d => d.crc)));
				state.descriptors = state.descriptors.filter(d => !crcs.includes(d.crc) || d.locked);
			} else if (state.settings.groupDescriptors === "none") {
				state.descriptors = state.descriptors.filter(d => !action.payload.includes(d.id) || d.locked);
			}
		},
		importState(_state, action: PayloadAction<IRootState>) {
			return {...action.payload.inspector};
		},
		importItems: {
			reducer(state, action: PayloadAction<{items: IDescriptor[]; kind: TImportItems}>) {
				if (action.payload.kind === "append") {
					action.payload.items.forEach(desc => desc.id = crypto.randomUUID());
					state.descriptors = [...state.descriptors, ...action.payload.items];
				} else if (action.payload.kind === "replace") {
					state.descriptors = action.payload.items;
				}
			},
			prepare(items: IDescriptor[], kind: TImportItems) {
				return {payload: {items, kind}};
			},
		},
		importReplace: {
			reducer() {/* handled externally */},
			prepare() {return {payload: null};},
		},
		exportSelectedDesc: {
			reducer() {/* handled externally */},
			prepare() {return {payload: null};},
		},
		exportAllDesc: {
			reducer() {/* handled externally */},
			prepare() {return {payload: null};},
		},
		exportState: {
			reducer() {/* handled externally */},
			prepare() {return {payload: null};},
		},
		setInspectorPathDiff: {
			reducer(state, action: PayloadAction<{path: KeyPath; mode: "replace" | "add"}>) {
				if (action.payload.mode === "add") {
					state.inspector.difference.treePath = [...state.inspector.difference.treePath, ...action.payload.path];
				} else {
					state.inspector.difference.treePath = action.payload.path;
				}
			},
			prepare(path: KeyPath, mode: "replace" | "add") {
				return {payload: {path, mode}};
			},
		},
		setInspectorPathContent: {
			reducer(state, action: PayloadAction<{path: KeyPath; mode: "replace" | "add"}>) {
				if (action.payload.mode === "add") {
					state.inspector.content.treePath = [...state.inspector.content.treePath, ...action.payload.path];
				} else {
					state.inspector.content.treePath = action.payload.path;
				}
				state.inspector.content.expandedTree = [];
				state.inspector.dom.expandedTree = [];
				state.inspector.difference.expandedTree = [];
			},
			prepare(path: KeyPath, mode: "replace" | "add") {
				return {payload: {path, mode}};
			},
		},
		setInspectorPathDom: {
			reducer(state, action: PayloadAction<{path: KeyPath; mode: "replace" | "add"}>) {
				if (action.payload.mode === "add") {
					state.inspector.dom.treePath = [...state.inspector.dom.treePath, ...action.payload.path];
				} else {
					state.inspector.dom.treePath = action.payload.path;
				}
			},
			prepare(path: KeyPath, mode: "replace" | "add") {
				return {payload: {path, mode}};
			},
		},
		setFilterState: {
			reducer(state, action: PayloadAction<{type: TTargetReference; subType: TSubTypes | "main" | "properties"; state: TFilterState}>) {
				const {state: filterState, subType, type} = action.payload;
				const found = state.targetReference[type];

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

				const map = filterClasses.map((c, index) => ({
					filterClass: c,
					className: classes[index],
					assign: (str: TFilterState) => {
						if (c in found) {
							(found as any)[c] = str;
						}
					},
				}));

				function disableAllNonMain() {
					map.forEach(item => { item.assign("off"); });
				}

				if (subType === "main") {
					if (filterState === "on") {
						state.filterBySelectedReferenceType = "off";
					} else {
						state.filterBySelectedReferenceType = "on";
					}
					disableAllNonMain();
				} else {
					if (filterState === "on") {
						disableAllNonMain();
						state.filterBySelectedReferenceType = "off";
					} else {
						let foundIndex: number | null = null;
						map.forEach((item, index) => {
							if (item.className === subType) {
								foundIndex = index;
								item.assign("on");
								state.filterBySelectedReferenceType = "semi";
							} else if (foundIndex === null) {
								item.assign("semi");
							} else {
								item.assign("off");
							}
						});
					}
				}
			},
			prepare(type: TTargetReference, subType: TSubTypes | "main" | "properties", filterState: TFilterState) {
				return {payload: {type, subType, state: filterState}};
			},
		},
		setListener(state, action: PayloadAction<boolean>) {
			state.settings.autoUpdateListener = action.payload;
			if (action.payload) {
				const LC = getListenerClass();
				LC.stopInspector();
				LC.stopSpy();
				state.settings.autoUpdateInspector = false;
				state.settings.autoUpdateSpy = false;
			}
		},
		setAutoInspector(state, action: PayloadAction<boolean>) {
			state.settings.autoUpdateInspector = action.payload;
			if (action.payload) {
				const LC = getListenerClass();
				LC.stopListener();
				LC.stopSpy();
				state.settings.autoUpdateListener = false;
				state.settings.autoUpdateSpy = false;
			}
		},
		setSpy(state, action: PayloadAction<boolean>) {
			state.settings.autoUpdateSpy = action.payload;
			if (action.payload) {
				const LC = getListenerClass();
				LC.stopListener();
				LC.stopInspector();
				state.settings.autoUpdateListener = false;
				state.settings.autoUpdateInspector = false;
			}
		},
		setExpandedPath: {
			reducer(state, action: PayloadAction<{type: ITreeDataTabs; path: KeyPath; expand: boolean; recursive: boolean; data: any}>) {
				const {expand, path, recursive, type} = action.payload;
				let {data} = action.payload;

				function getDataPart(d: any, tPath: KeyPath | undefined): any {
					if (!tPath) {return d;}
					let sub = d;
					for (const part of tPath) {
						sub = sub?.[part];
					}
					return sub;
				}

				function isCyclical(tPath: KeyPath, toTest: any): boolean {
					let sub = data;
					tPath = [...path, ...tPath];
					tPath.splice(tPath.length - 1, 1);
					for (const part of tPath) {
						sub = sub?.[part];
						if (sub === toTest) {return true;}
					}
					return false;
				}

				function generatePaths(d: any): KeyPath[] {
					const paths: KeyPath[] = [];
					traverse(d);
					return paths;
					function traverse(d: any, tPath: KeyPath = []): void {
						if (d && typeof d === "object" && !isCyclical(tPath, d)) {
							paths.push([...path, ...tPath]);
							const keys = Object.keys(d);
							if (type === "dom") {
								keys.push(...addMoreKeys("uxp", d));
								keys.sort();
							}
							for (const key of keys) {
								traverse(d[key], [...tPath, key]);
							}
						}
					}
				}

				let draftPart: IContent | IDifference | IDOM | null = null;

				switch (type) {
					case "content": draftPart = state.inspector.content; break;
					case "difference": draftPart = state.inspector.difference; break;
					case "dom": draftPart = state.inspector.dom; break;
					default: throw new Error("Unknown type in SET_EXPANDED_PATH_ACTION");
				}

				if (type === "dom") {
					data = getTreeDomInstanceLazy()({inspector: state});
				}

				if (draftPart) {
					let index: number | null = null;
					const found = draftPart.expandedTree.find((item, i) => {
						index = i;
						return item.join("-") === path.join("-");
					});
					if (expand && !found) {
						if (recursive) {
							const parts = generatePaths(getDataPart(data, path));
							draftPart.expandedTree.push(...parts);
						} else {
							draftPart.expandedTree.push(path);
						}
					} else if ((found || recursive) && index !== null) {
						if (recursive) {
							const parts = generatePaths(getDataPart(data, path));
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
			},
			prepare(type: ITreeDataTabs, path: KeyPath, expand: boolean, recursive: boolean, data: any) {
				return {payload: {type, path, expand, recursive, data}};
			},
		},
		setSearchTerm(state, action: PayloadAction<string | null>) {
			state.settings.searchTerm = action.payload;
		},
		setListenerNotifierFilter: {
			reducer(state, action: PayloadAction<{data: Partial<IListenerNotifierFilter>}>) {
				if (state.selectedReferenceType === "listener") {
					state.settings.listenerFilter = {
						...state.settings.listenerFilter,
						...action.payload.data,
					};
				} else if (state.selectedReferenceType === "notifier") {
					state.settings.notifierFilter = {
						...state.settings.notifierFilter,
						...action.payload.data,
					};
				}
			},
			prepare(data: Partial<IListenerNotifierFilter>) {
				return {payload: {data}};
			},
		},
		filterEventName: {
			reducer(_state, _action: PayloadAction<{eventName: string; kind: "include" | "exclude"; operation: "add" | "remove"}>) {
				/* no in-store handling currently */
			},
			prepare(eventName: string, kind: "include" | "exclude", operation: "add" | "remove") {
				return {payload: {eventName, kind, operation}};
			},
		},
		setDispatcherValue(state, action: PayloadAction<string>) {
			state.dispatcher.snippets[0].content = action.payload;
		},
		renameDescriptor: {
			reducer(state, action: PayloadAction<{uuid: string; name: string}>) {
				const found = state.descriptors.find(desc => desc.id === action.payload.uuid);
				if (found) {found.title = action.payload.name;}
			},
			prepare(uuid: string, name: string) {
				return {payload: {name, uuid}};
			},
		},
		setRenameMode: {
			reducer(state, action: PayloadAction<{uuid: string; on: boolean}>) {
				const found = state.descriptors.find(desc => desc.id === action.payload.uuid);
				if (found) {found.renameMode = action.payload.on;}
			},
			prepare(uuid: string, on: boolean) {
				return {payload: {on, uuid}};
			},
		},
		setDescriptorOptions: {
			reducer(state, action: PayloadAction<{uuids: string[] | "default"; options: Partial<IDescriptorSettings>}>) {
				if (action.payload.uuids === "default") {
					state.settings.initialDescriptorSettings = {
						...state.settings.initialDescriptorSettings,
						...action.payload.options,
					};
				} else {
					for (let i = 0, len = action.payload.uuids.length; i < len; i++) {
						const found = state.descriptors.find(desc => desc.id === (action.payload.uuids as string[])[i]);
						if (found) {
							found.descriptorSettings = {
								...found.descriptorSettings,
								...action.payload.options,
							};
						}
					}
				}
			},
			prepare(uuids: string[] | "default", options: Partial<IDescriptorSettings>) {
				return {payload: {uuids, options}};
			},
		},
		toggleSettings: {
			reducer(state) {
				state.settings.settingsVisible = !state.settings.settingsVisible;
			},
			prepare() {return {payload: null};},
		},
		setInspectorView: {
			reducer(state, action: PayloadAction<{inspectorType: "content" | "diff" | "code"; viewType: TGenericViewType | TCodeViewType}>) {
				const {inspectorType, viewType} = action.payload;
				switch (inspectorType) {
					case "code": state.inspector.code.viewType = viewType as TCodeViewType; break;
					case "content": state.inspector.content.viewType = viewType as TGenericViewType; break;
					case "diff": state.inspector.difference.viewType = viewType as TGenericViewType; break;
				}
			},
			prepare(inspectorType: "content" | "diff" | "code", viewType: TGenericViewType | TCodeViewType) {
				return {payload: {inspectorType, viewType}};
			},
		},
		setColumnSize: {
			reducer(state, action: PayloadAction<{location: "left" | "right"; value: number}>) {
				if (action.payload.location === "left") {
					state.settings.leftColumnWidthPx = action.payload.value;
				} else {
					state.settings.rightColumnWidthPx = action.payload.value;
				}
			},
			prepare(px: number, location: "left" | "right") {
				return {payload: {value: px, location}};
			},
		},
		setRecordRaw(state, action: PayloadAction<boolean>) {
			state.settings.makeRawDataEasyToInspect = action.payload;
		},
		setAutoExpandLevel: {
			reducer(state, action: PayloadAction<{level: number; part: "DOM" | "content" | "diff"}>) {
				switch (action.payload.part) {
					case "DOM": state.inspector.dom.autoExpandLevels = action.payload.level; break;
					case "content": state.inspector.content.autoExpandLevels = action.payload.level; break;
					case "diff": state.inspector.difference.autoExpandLevels = action.payload.level; break;
				}
			},
			prepare(part: "DOM" | "content" | "diff", level: number) {
				return {payload: {level, part}};
			},
		},
		setMaximumItems: {
			reducer(state, action: PayloadAction<string>) {
				let num = parseInt(action.payload);
				if (num < 3 || Number.isNaN(num)) {num = 3;}
				state.settings.maximumItems = num;
			},
			prepare(value: string) {
				return {payload: value};
			},
		},
		setDontShowMarketplaceInfo(state, action: PayloadAction<boolean>) {
			state.settings.dontShowMarketplaceInfo = action.payload;
		},
		setFontSize(state, action: PayloadAction<TFontSizeSettings>) {
			state.settings.fontSize = action.payload;
		},
		setNeverRecordActionNames: {
			reducer(state, action: PayloadAction<string[]>) {
				state.settings.neverRecordActionNames = action.payload;
			},
			prepare(value: string) {
				return {payload: value.split(/[\n\r]/g).map(v => v.trim())};
			},
		},
		toggleDescriptorsGrouping: {
			reducer(state, action: PayloadAction<"none" | "strict" | null>) {
				if (action.payload === null) {
					state.settings.groupDescriptors = state.settings.groupDescriptors === "strict" ? "none" : "strict";
				} else {
					state.settings.groupDescriptors = action.payload;
				}
			},
			prepare(arg: "none" | "strict" | null = null) {
				return {payload: arg};
			},
		},
		setSettings(state, action: PayloadAction<Partial<ISettings>>) {
			state.settings = {
				...state.settings,
				...action.payload,
			};
		},
		toggleAccordion: {
			reducer(state, action: PayloadAction<{id: string; expanded: boolean}>) {
				if (action.payload.expanded) {
					if (!state.settings.accordionExpandedIDs.includes(action.payload.id)) {
						state.settings.accordionExpandedIDs.push(action.payload.id);
					}
				} else {
					if (state.settings.accordionExpandedIDs.includes(action.payload.id)) {
						state.settings.accordionExpandedIDs = state.settings.accordionExpandedIDs.filter(id => id !== action.payload.id);
					}
				}
			},
			prepare(id: string, expanded: boolean) {
				return {payload: {id, expanded}};
			},
		},
		setSearchContentKeyword(state, action: PayloadAction<string>) {
			state.inspector.content.search = action.payload;
		},
		setCategoryItemVisibility: {
			reducer(state, action: PayloadAction<{operation: "add" | "remove"; value: TTargetReference}>) {
				const set = new Set(state.explicitlyVisibleTopCategories);
				if (action.payload.operation === "add") {
					set.add(action.payload.value);
				} else {
					set.delete(action.payload.value);
				}
				state.explicitlyVisibleTopCategories = [...set];
			},
			prepare(value: TTargetReference, operation: "add" | "remove") {
				return {payload: {operation, value}};
			},
		},
	},
});
