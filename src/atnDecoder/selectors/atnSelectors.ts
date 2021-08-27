import { createSelector } from "reselect";
import { IRootState } from "../../shared/store";

import stringifyObject from "stringify-object";
import { IActionCommandUUID, IActionItemUUID, IActionSetUUID, IATNConverterState, TExpandedItem, TSelectedItem } from "../types/model";
import { IInspectorState } from "../../inspector/model/types";

export const all = (state:IRootState):IATNConverterState => state.inspector.atnConverter;
export const getData = createSelector([all], s => s.data);

export const getSetByUUID = (state: IInspectorState,uuidSet:string):IActionSetUUID => {
	const res = state.atnConverter.data.find(set => set.__uuid__ === uuidSet) || null;
	return res;
};

export const getActionByUUID = (state: IInspectorState, uuidSet: string, uuidAction:string): IActionItemUUID => {
	const res = getSetByUUID(state,uuidSet)?.actionItems.find(item=>item.__uuid__ === uuidAction) || null;
	return res;
};

export const getCommandByUUID = (state: IInspectorState, uuidSet: string, uuidAction: string, uuidCommand:string): IActionCommandUUID => {
	const res = getActionByUUID(state,uuidSet,uuidAction)?.commands.find(item=>item.__uuid__ === uuidCommand) || null;
	return res;
};

export function getTreePartUniversal (state: IInspectorState, path: [string]):IActionSetUUID
export function getTreePartUniversal (state: IInspectorState, path: [string,string]):IActionItemUUID
export function getTreePartUniversal (state: IInspectorState, path: [string,string,string]):IActionCommandUUID
export function getTreePartUniversal(state: IInspectorState, path: [string, string?, string?]): IActionSetUUID | IActionItemUUID | IActionCommandUUID {
	switch (path.length) {
		case 1:
			return getSetByUUID(state, path[0]);
		case 2:
			return getActionByUUID(state, path[0], path[1]);
		case 3:
			return getCommandByUUID(state, path[0], path[1], path[2]);
	}
}

export const getExpandedItemsSet = createSelector([all],s=>{
	return s.expandedItems.filter(item => item.length === 1);
});

export const getSelectedItemsSet = createSelector([all],s=>{
	return s.selectedItems.filter(item => item.length === 1);

});

export const getExpandedItemsAction = createSelector([all], s => {
	return s.expandedItems.filter(item => item.length === 2);
});

export const getSelectedItemsAction = createSelector([all],s=>{
	return s.selectedItems.filter(item => item.length === 2);

});

export const getSelectedItemsCommand = createSelector([all], s => {
	return s.selectedItems.filter(item => item.length === 3);

});

export const getDontSendDisabled = createSelector([all], s => {
	return s.dontSendDisabled;

});

export const selectedSets = createSelector([
	all,
	getSelectedItemsSet,
], (s,sets) => {
	const res: (IActionSetUUID)[] = [];
	
	sets.forEach(set => {
		const found = s.data.find((r => r.__uuid__ === set[0]));
		if (found) {
			res.push(found);			
		}
	});

	return res;
});

export const selectedActions = createSelector([
	all,
	getSelectedItemsAction,
], (s,actions) => {
	const res: (IActionItemUUID)[] = [];
	
	actions.forEach(item => {
		const found = s.data.find((r => r.__uuid__ === item[0]));
		const found2 = found?.actionItems?.find((r => r.__uuid__ === item[1]));
		if (found2) {
			res.push(found2);			
		}
	});

	return res;
});

export const selectedCommands = createSelector([
	all,
	getSelectedItemsCommand,
], (s,commands) => {
	const res: (IActionCommandUUID)[] = [];
	
	commands.forEach(item => {
		const found = s.data.find((r => r.__uuid__ === item[0]));
		const found2 = found?.actionItems?.find((r => r.__uuid__ === item[1]));
		const found3 = found2?.commands?.find((r => r.__uuid__ === item[2]));
		if (found3) {
			res.push(found3);			
		}
	});

	return res;
});

export const selected = createSelector([
	selectedSets,
	selectedActions,
	selectedCommands,
], (sets,actions,commands) => {
	const res: (IActionSetUUID | IActionItemUUID | IActionCommandUUID)[] = [...sets,...actions,...commands];
	return res;
});

export const getLastSelected = createSelector([
	selectedSets,
	selectedActions,
	selectedCommands,
	all,
], (sets,actions,commands,all) => {
	const len = all.lastSelected?.length;
	if (len === 1) {
		return sets.find(s => s.__uuid__ === all.lastSelected[0]) || null;
	}
	if (len === 2) {
		return actions.find(s => s.__uuid__ === all.lastSelected[1]) || null;
	}
	if (len === 3) {
		return commands.find(s => s.__uuid__ === all.lastSelected[2]) || null;		
	}
	return null;
});


export const getTextData = createSelector([
	all,
	getLastSelected,
], (all, lastOne) => {

	if (all.data.length === 0) {
		return "The Occultist is bored. Give him some files to look into.";
	}

	if (!all.lastSelected) {
		return "Please select some item";
	} else if (all.selectedItems.length === 0) {
		const res = stringifyObject(all.data, {
			indent: "   ",
			filter: ((input, prop) => (!(prop === "__uuid__")) && !(prop === "__uuidParentSet__") && !(prop === "__uuidParentAction__")), // get rid of  __uuid__ added by occultist
		});
		return res;
	} else if(all.lastSelected) {
		const res = stringifyObject(lastOne, {
			indent: "   ",
			filter: ((input, prop) => (!(prop === "__uuid__")) && !(prop === "__uuidParentSet__") && !(prop === "__uuidParentAction__")), // get rid of  __uuid__ added by occultist
		});
		return res;
	}
	return "Error";
});