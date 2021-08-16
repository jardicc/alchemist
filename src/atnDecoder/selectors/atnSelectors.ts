import { createSelector } from "reselect";
import { IRootState } from "../../shared/store";

import stringifyObject from "stringify-object";
import { IATNConverterState } from "../types/model";

export const all = (state:IRootState):IATNConverterState => state.inspector.atnConverter;
export const getData = createSelector([all], s => s.data);

export const getTextData = createSelector([all], s => {
	const res = stringifyObject(s.data, {
		indent: "   ",
		
	});
	return res;
});

export const getExpandedItemsSet = createSelector([all],s=>{
	return s.expandedItems.filter(item => item.length === 1);
});

export const getSelectedItemsSet = createSelector([all],s=>{
	return s.expandedItems.filter(item => item.length === 1);

});

export const getExpandedItemsAction = createSelector([all], s => {
	return s.expandedItems.filter(item => item.length === 2);
});

export const getSelectedItemsAction = createSelector([all],s=>{
	return s.expandedItems.filter(item => item.length === 2);

});

export const getSelectedItemsCommand = createSelector([all], s => {
	return s.selectedItems.filter(item => item.length === 3);

});

