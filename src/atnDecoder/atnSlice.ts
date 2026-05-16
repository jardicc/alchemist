import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {uniqBy} from "lodash";
import {IInspectorState} from "../inspector/model/types";
import {getInitialState} from "../inspector/inspInitialState";
import {Settings} from "../inspector/classes/Settings";
import {IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem} from "./atnModel";
import {getSetByUUID} from "./atnSelectors";

const initialAtnState = {} as IInspectorState;

export const atnSlice = createSlice({
	name: "atn",
	initialState: initialAtnState,
	reducers: {
		clearAll(state) {
			state.atnConverter.data = [];
		},
		setData(state, action: PayloadAction<IActionSetUUID[]>) {
			state.atnConverter.data.push(...action.payload as any);
		},
		expandAction: {
			reducer(state, action: PayloadAction<{uuid: TExpandedItem; expand: boolean; recursive: boolean}>) {
				const {expand, recursive, uuid} = action.payload;

				const indexOf = state.atnConverter.expandedItems.findIndex(item => {
					if (item.length !== uuid.length) {return false;}
					return item[0] === uuid[0] && item[1] === uuid[1];
				});

				if (expand) {
					if (indexOf === -1) {
						state.atnConverter.expandedItems.push(uuid);
						if (recursive && uuid.length === 1) {
							const found = getSetByUUID(state as IInspectorState, uuid[0]);
							if (found) {
								const rest: TExpandedItem[] = found.actionItems.map(item => [item.__uuidParentSet__, item.__uuid__]);
								state.atnConverter.expandedItems.push(...rest);
							}
						}
					}
				} else {
					if (indexOf !== -1) {
						state.atnConverter.expandedItems.splice(indexOf, 1);
						if (recursive && uuid.length === 1) {
							const found = getSetByUUID(state as IInspectorState, uuid[0]);
							if (found) {
								const rest: string[] = found.actionItems.map(item => [item.__uuidParentSet__, item.__uuid__].join("|"));
								rest.forEach(itm => {
									const index = state.atnConverter.expandedItems.findIndex(a => a.join("|") === itm);
									state.atnConverter.expandedItems.splice(index, 1);
								});
							}
						}
					}
				}
			},
			prepare(uuid: TExpandedItem, expand: boolean, recursive = false) {
				return {payload: {uuid, expand, recursive}};
			},
		},
		setDontSendDisabled(state, action: PayloadAction<boolean>) {
			state.atnConverter.dontSendDisabled = action.payload;
		},
		selectAction: {
			reducer(state, action: PayloadAction<{operation: TSelectActionOperation; uuid?: TSelectedItem}>) {
				const {operation, uuid} = action.payload;
				const data = state.atnConverter.data;

				function addChilds(items: TSelectedItem[]): TSelectedItem[] {
					const sets = items.filter(i => i.length === 1);
					const actions = items.filter(i => i.length === 2);
					const commands = items.filter(i => i.length === 3);

					sets.forEach(s => {
						data.forEach(ss => {
							if (ss.__uuid__ === s[0]) {
								ss.actionItems.forEach(si => {
									actions.push([ss.__uuid__, si.__uuid__]);
									si.commands.forEach(sc => {
										commands.push([ss.__uuid__, si.__uuid__, sc.__uuid__]);
									});
								});
							}
						});
					});

					actions.forEach(a => {
						data.forEach(ss => ss.actionItems.forEach(si => {
							if (si.__uuid__ === a[1]) {
								si.commands.forEach(sc => {
									commands.push([ss.__uuid__, si.__uuid__, sc.__uuid__]);
								});
							}
						}));
					});

					const all = [...sets, ...actions, ...commands];
					return uniqBy(all, i => i.join("|"));
				}

				if (operation === "none") {
					state.atnConverter.selectedItems = [];
				} else if (operation === "replace" && uuid?.length) {
					state.atnConverter.selectedItems = addChilds([uuid]) as any;
				} else if (operation === "subtract" && uuid?.length) {
					const all = addChilds([uuid]).map(item => item.join("|"));
					all.forEach(itemFromAll => {
						const foundIndex = state.atnConverter.selectedItems.findIndex(itemFromDraft => itemFromDraft.join("|") === itemFromAll);
						if (foundIndex > -1) {
							state.atnConverter.selectedItems.splice(foundIndex, 1);
						}
					});
				} else if (operation === "add" && uuid?.length) {
					state.atnConverter.selectedItems = [...state.atnConverter.selectedItems, ...addChilds([uuid])] as any;
				}

				state.atnConverter.lastSelected = uuid || getInitialState().atnConverter.lastSelected;
			},
			prepare(operation: TSelectActionOperation, uuid?: TSelectedItem) {
				return {payload: {operation, uuid}};
			},
		},
		passSelected: {
			reducer() {/* handled externally */},
			prepare() {return {payload: null};},
		},
	},
});

export const atnSliceReducer = atnSlice.reducer;
