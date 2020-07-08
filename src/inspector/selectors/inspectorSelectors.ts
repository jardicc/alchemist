import { createSelector } from "reselect";
import { IRootState } from "../../store";

const all = (state:IRootState) => state.inspector;
 
export const getMainTabID = createSelector([all], s => s.activeSection);
export const getModeTabID = createSelector([all], s => s.inspector.activeTab);

export const getSelectedTargetReference = createSelector([all], s => s.selectedReferenceType);
export const getTargetReference = createSelector([all], s => s.targetReference);
export const getAutoUpdate = createSelector([all],s=>s.settings.autoUpdate);
export const getAllDescriptors = createSelector([all], s => s.descriptors);
export const getSelectedDescriptors = createSelector([all], s => s.descriptors.filter((d) => d.selected === true));
export const getSelectedDescriptorsUUID = createSelector([getSelectedDescriptors], s => s.map(d => d.id));
export const getPropertySettings = createSelector([all],s=>s.settings.properties);
export const getLockedSelection = createSelector([getSelectedDescriptors], s => s.some(d => d.locked));
export const getPinnedSelection = createSelector([getSelectedDescriptors], s => s.some(d => d.pinned));
export const getRemovableSelection = createSelector([getLockedSelection], s => !s);

export const getActiveTargetReference = createSelector([getTargetReference, getSelectedTargetReference], (targets, selected) => {
	const result = targets.find(item => item.type === selected);
	return result;
});

export const getAddAllowed = createSelector([getActiveTargetReference], s => { 
	if (s) {
		for (const key in s.data) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((s.data as any)[key] === "undefined") {
				return false;
			}
		}
		return true;
	}
	return false;
});
export const getActiveReferenceProperty = createSelector([getActiveTargetReference], (t) => {	
	if (t  && "property" in t.data) {
		return t.data.property;
	}
	return "undefined";
});
export const getActiveReferenceGuide = createSelector([getActiveTargetReference], (t) => {
	if (t && t.type === "guide") {
		return t.data.guide;
	}
	return "undefined";
});
export const getActiveReferencePath = createSelector([getActiveTargetReference], (t) => {
	if (t && t.type === "path") {
		return t.data.path;
	}
	return "undefined";
});
export const getActiveReferenceChannel = createSelector([getActiveTargetReference], (t) => {
	if (t && t.type === "channel") {
		return t.data.channel;
	}
	return "undefined";
});
export const getActiveReferenceActionSet = createSelector([getActiveTargetReference], (t) => {
	if (t && t.type === "action") {
		return t.data.actionset;
	}
	return "undefined";
});
export const getActiveReferenceActionItem = createSelector([getActiveTargetReference], (t) => {
	if (t && t.type === "action") {
		return t.data.action;
	}
	return "undefined";
});
export const getActiveReferenceCommand = createSelector([getActiveTargetReference], (t) => {
	if (t && t.type === "action") {
		return t.data.command;
	}
	return "undefined";
});

export const getActiveDescriptors = createSelector([all], s => {
	const selected = s.descriptors.filter(d => d.selected);
	return selected;
});

export const getActiveDescriptorContent = createSelector([getActiveDescriptors], selected => {	
	if (selected.length !== 1) {
		return "Select 1 descriptor";
	}
	return JSON.stringify(selected[0].originalData, null, 3);
});

export const getActiveDescriptorReference = createSelector([getActiveDescriptors], selected => {	
	if (selected.length !== 1) {
		return "Select 1 descriptor";
	}
	return JSON.stringify(selected[0].originalReference, null, 3);
});

export const getActiveTargetDocument = createSelector([getActiveTargetReference], (t) => {
	if (!t) { return "undefined";}
	switch (t.type) {
		case "channel":
		case "document":
		case "guide":
		case "history":
		case "layer":
		case "path":
		case "snapshot":
			return t.data.document;
		default:
			return "undefined";
	}
});

export const getActiveTargetLayer = createSelector([getActiveTargetReference], (t) => {
	if (!t) { return "undefined";}
	switch (t.type) {
		case "channel":
		case "layer":
		case "path":
			return t.data.layer;
		default:
			return "undefined";
	}
});

// action

