import { cloneDeep } from "lodash";
import { createSelector } from "reselect";
import { all, getSelectedDescriptors, getAutoActiveDescriptor, getSecondaryAutoActiveDescriptor } from "./inspectorSelectors";

export const getInspectorDifferenceTab = createSelector([all],t=>{
	return t.inspector.difference;
});

export const getDiffPath = createSelector([getInspectorDifferenceTab],t=>{
	return t.treePath;
});

export const getDiffActiveView = createSelector([getInspectorDifferenceTab], t => {
	return t.viewType;
});

export const getLeftTreeDiff = createSelector([getSelectedDescriptors, getDiffPath, getAutoActiveDescriptor], (t, diffPath,autoDesc) => {
	const path = cloneDeep(diffPath);
	//path.shift();
	let data:any = cloneDeep(t?.[0]?.originalData ?? autoDesc?.originalData);
	for (const part of path) {
		data = (data)?.[part];
	}
	return data;
});

export const getRightTreeDiff  = createSelector([getSelectedDescriptors,getDiffPath,getSecondaryAutoActiveDescriptor],(t,diffPath,autoDesc)=>{
	const path = cloneDeep(diffPath);
	//path.shift();
	let data:any = cloneDeep(t?.[1]?.originalData ?? autoDesc?.originalData);
	for (const part of path) {
		data = (data)?.[part];
	}
	return data;
});

export const getLeftRawDiff = createSelector([getSelectedDescriptors, getAutoActiveDescriptor], (t, autoDesc) => {
	const data:any = t?.[0]?.originalData ?? autoDesc?.originalData;
	return data;
});

export const getRightRawDiff = createSelector([getSelectedDescriptors, getSecondaryAutoActiveDescriptor], (t, autoDesc) => {
	const data:any = t?.[1]?.originalData ?? autoDesc?.originalData;
	return data;
});

export const getDiffExpandedNodes = createSelector([getInspectorDifferenceTab], (t) => {	
	return t.expandedTree;
});