import { createSelector } from "reselect";
import { IRootState } from "../../shared/store";

import stringifyObject from "stringify-object";
import { IActionCommandUUID, IActionItemUUID, IActionSetUUID, IATNConverterState } from "../types/model";

export const all = (state:IRootState):IATNConverterState => state.inspector.atnConverter;
export const getData = createSelector([all], s => s.data);



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

export const selected = createSelector([
	all,
	getSelectedItemsSet,
	getSelectedItemsAction,
	getSelectedItemsCommand,
], (s,sets,actions,commands) => {
	const res: (IActionSetUUID | IActionItemUUID | IActionCommandUUID)[] = [];
	
	sets.forEach(set => {
		const found = s.data.find((r => r.__uuid__ === set[0]));
		if (found) {
			res.push(found);			
		}
	});
	
	actions.forEach(item => {
		const found = s.data.find((r => r.__uuid__ === item[0]));
		const found2 = found?.actionItems?.find((r => r.__uuid__ === item[1]));
		if (found2) {
			res.push(found2);			
		}
	});
	
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


export const getTextData = createSelector([
	all,
	selected,
], (all, selected) => {

	if (all.data.length === 0) {
		return "Please open some .atn file";
	}

	if (all.selectedItems.length > 1) {
		return "This works only with 1 item selected";
	} else if (all.selectedItems.length === 0) {
		const res = stringifyObject(all.data, {
			indent: "   ",
			filter: ((input, prop) => !(prop === "__uuid__")), // get rid of  __uuid__ added by occultist
		});
		return res;
	} else {
		const res = stringifyObject(selected, {
			indent: "   ",
			filter: ((input, prop) => !(prop === "__uuid__")), // get rid of  __uuid__ added by occultist
		});
		return res;
	}
});