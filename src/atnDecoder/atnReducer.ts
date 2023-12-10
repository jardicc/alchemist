import produce from "immer";
import {uniqBy} from "lodash";
import {IInspectorState} from "../inspector/model/types";
import {TAllActions} from "../inspector/reducers/reducer";
import {getInitialState} from "../inspector/inspInitialState";
import {TExpandedItem, TSelectedItem} from "./atnModel";
import {getSetByUUID} from "./atnSelectors";


export const atnReducer = (state: IInspectorState, action: TAllActions): IInspectorState => {
	switch (action.type) {
		case "[ATN] CLEAR_ALL": {
			state = produce(state, draft => {
				draft.atnConverter.data = [];
			});
			break;
		}
		case "[ATN] SET_DATA": {
			state = produce(state, draft => {
				draft.atnConverter.data.push(...action.payload);
			});
			break;
		}

		case "[ATN] EXPAND_ACTION": {
			state = produce(state, draft => {
				const {expand, recursive, uuid} = action.payload;
				//const treePart = getTreePartUniversal(state, uuid);


				const indexOf = draft.atnConverter.expandedItems.findIndex(item => {
					if (item.length !== action.payload.uuid.length) {
						return false;
					}
					const res = (item[0] === action.payload.uuid[0] && item[1] === action.payload.uuid[1]);
					return res;
				});

				if (expand) {
					if (indexOf === -1) {
						draft.atnConverter.expandedItems.push(uuid);
						if (recursive && uuid.length === 1) {
							const found = getSetByUUID(state, uuid[0]);
							if (found) {
								const rest: TExpandedItem[] = found.actionItems.map(item => [item.__uuidParentSet__, item.__uuid__]);
								draft.atnConverter.expandedItems.push(...rest);
							}
						}
					}
				} else {
					if (indexOf !== -1) {
						draft.atnConverter.expandedItems.splice(indexOf, 1);
						if (recursive && uuid.length === 1) {
							const found = getSetByUUID(state, uuid[0]);
							if (found) {
								const rest: string[] = found.actionItems.map(item => [item.__uuidParentSet__, item.__uuid__].join("|"));
								rest.forEach(itm => {
									const index = draft.atnConverter.expandedItems.findIndex((a) => {
										return a.join("|") === itm;
									});
									draft.atnConverter.expandedItems.splice(index, 1);
								});
							}
						}
					}
				}
			});
			break;
		}

		case "[ATN] SET_DONT_SEND_DISABLED": {
			state = produce(state, draft => {
				draft.atnConverter.dontSendDisabled = action.payload;
			});
			break;
		}

		case "[ATN] SELECT_ACTION": {
			state = produce(state, draft => {
				const {operation, uuid} = action.payload;
				const {data} = state.atnConverter;
				if (operation === "none") {
					draft.atnConverter.selectedItems = [];
				} else if (operation === "replace" && uuid?.length) {
					draft.atnConverter.selectedItems = addChilds([uuid]);
				} else if (operation === "subtract" && uuid?.length) {
					const all = addChilds([uuid]).map(item => item.join("|"));

					all.forEach((itemFromAll) => {
						const foundIndex = draft.atnConverter.selectedItems.findIndex(itemFromDraft => (itemFromDraft.join("|") === itemFromAll));
						if (foundIndex > -1) {
							draft.atnConverter.selectedItems.splice(foundIndex, 1);
						}
					});
				} else if (operation === "add" && uuid?.length) {
					draft.atnConverter.selectedItems = [...state.atnConverter.selectedItems, ...addChilds([uuid])];
				}

				function addChilds(items: TSelectedItem[]): TSelectedItem[] {
					//let sorted = items.sort((a, b) => a.length - b.length);

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
					const allUnique = uniqBy(all, (i) => i.join("|"));

					return allUnique;
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

			return state;
	}

	return state;
};

