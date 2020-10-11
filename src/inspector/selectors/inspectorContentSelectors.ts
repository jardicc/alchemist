import { cloneDeep } from "lodash";
import { createSelector } from "reselect";
import { getSelectedDescriptors, getAutoActiveDescriptor, getActiveDescriptors, all } from "./inspectorSelectors";

export const getInspectorContentTab = createSelector([all], t => {
	return t.inspector.content;
});

export const getContentPath = createSelector([getInspectorContentTab], t => {
	return t.treePath;
});

export const getContentActiveView = createSelector([getInspectorContentTab], t => {
	return t.viewType;
});

export const getTreeContent = createSelector([getSelectedDescriptors, getContentPath, getAutoActiveDescriptor], (t, d,autoActive) => {
	const path = cloneDeep(d);
	// selected or auto-selected
	let data: any = cloneDeep(t?.[0]?.originalData ?? autoActive?.originalData);

	for (const part of path) {
		data = (data)?.[part];
	}

	// make primitive types pin-able
	if (typeof data !== "object" && data !== undefined && data !== null) {
		const lastPart = path[path.length - 1];
		data = { ["$$$noPin_"+lastPart]:data };
	}
	return data;
});

export const getActiveDescriptorContent = createSelector([getActiveDescriptors, getAutoActiveDescriptor], (selected, autoActive) => {
	if (selected.length >= 1) {
		const toSend = selected.map(item => item.originalData);
		return JSON.stringify(toSend.length === 1 ? toSend[0] : toSend, null, 3);
	} else if (autoActive) {
		return JSON.stringify(autoActive.originalData, null, 3);
	} else {
		return "Add some descriptor";
	}	
});

export const getContentExpandedNodes = createSelector([getInspectorContentTab], (t) => {	
	return t.expandedTree;
});

export const getContentExpandLevel = createSelector([getInspectorContentTab], (t) => {
	return t?.autoExpandLevels ?? 0;
});