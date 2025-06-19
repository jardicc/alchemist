import {cloneDeep} from "lodash";
import {createSelector} from "reselect";
import {all, getSelectedDescriptors, getAutoActiveDescriptor, getSecondaryAutoActiveDescriptor} from "./inspectorSelectors";

export const getInspectorDifferenceTab = createSelector([all], t => {
	return t.inspector.difference;
});

export const getDiffPath = createSelector([getInspectorDifferenceTab], t => {
	return t.treePath;
});

export const getDiffActiveView = createSelector([getInspectorDifferenceTab], t => {
	return t.viewType;
});

export const getLeftTreeDiff = createSelector([getSelectedDescriptors, getDiffPath, getAutoActiveDescriptor], (t, diffPath, autoDesc) => {
	let data: any = cloneDeep(t?.[0]?.recordedData ?? autoDesc?.recordedData);
	for (const part of diffPath) {
		data = data?.[part];
	}
	return data;
});

export const getRightTreeDiff = createSelector([getSelectedDescriptors, getDiffPath, getSecondaryAutoActiveDescriptor], (t, diffPath, autoDesc) => {
	let data: any = cloneDeep(t?.[1]?.recordedData ?? autoDesc?.recordedData);
	for (const part of diffPath) {
		data = data?.[part];
	}
	return data;
});

export const getLeftRawDiff = createSelector([getSelectedDescriptors, getAutoActiveDescriptor, getDiffPath], (selDesc, autoDesc, diffPath) => {
	let data: any = cloneDeep(selDesc?.[0]?.recordedData ?? autoDesc?.recordedData);
	for (const part of diffPath) {
		data = data?.[part];
	}
	return data;
});

export const getRightRawDiff = createSelector([getSelectedDescriptors, getSecondaryAutoActiveDescriptor, getDiffPath], (selDesc, autoDesc, diffPath) => {
	let data: any = cloneDeep(selDesc?.[1]?.recordedData ?? autoDesc?.recordedData);
	for (const part of diffPath) {
		data = data?.[part];
	}
	return data;
});

export const getDiffExpandedNodes = createSelector([getInspectorDifferenceTab], (t) => {
	return t.expandedTree;
});

export const getDiffExpandLevel = createSelector([getInspectorDifferenceTab], (t) => {
	return t?.autoExpandLevels ?? 0;
});