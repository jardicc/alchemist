import { createSelector } from "reselect";
import { IRootState } from "../../store";
import { create } from "lodash";
import { ITargetReference, ITargetReferenceGuide, TTargetReference, ITargetReferenceApplication, ITargetReferenceCustomDescriptor, ITargetReferenceHistory, ITargetReferenceSnapshot, ITargetReferenceLayer, ITargetReferencePath, ITargetReferenceChannel, ITargetReferenceDocument, ITargetReferenceAction, TActiveTargetReference } from "../reducers/initialStateInspector";

const all = (state:IRootState) => state.inspector;
 
export const getMainTabID = createSelector([all], s => s.activeSection);
export const getModeTabID = createSelector([all], s => s.inspector.activeTab);

export const getTargetReference = createSelector([all], s => s.targetReference);
export const getAutoUpdate = createSelector([all],s=>s.settings.autoUpdate);
export const getAllDescriptors = createSelector([all], s => s.descriptors);
export const getSelectedDescriptors = createSelector([all], s => s.descriptors.filter((d) => d.selected === true));
export const getSelectedDescriptorsUUID = createSelector([getSelectedDescriptors], s => s.map(d => d.id));
export const getPropertySettings = createSelector([all],s=>s.settings.properties);
export const getLockedSelection = createSelector([getSelectedDescriptors], s => s.some(d => d.locked));
export const getPinnedSelection = createSelector([getSelectedDescriptors], s => s.some(d => d.pinned));
export const getRemovableSelection = createSelector([getLockedSelection], s => !s);

export const getActiveTargetDocument = createSelector([getTargetReference], (t) => {
	switch (t.activeType) {
		case "channel":
			return t.channel.document;
		case "document":
			return t.document.document;
		case "guide":
			return t.guide.document;
		case "history":
			return t.history.document;
		case "layer":
			return t.layer.document;
		case "path":
			return t.path.document;
		case "snapshot":
			return t.snapshot.document;
		default:
			return "undefined";
	}
});
export const getActiveTargetLayer = createSelector([getTargetReference], (t) => {
	switch (t.activeType) {
		case "channel":
			return t.channel.layer;
		case "layer":
			return t.layer.layer;
		case "path":
			return t.path.layer;
		default:
			return "undefined";
	}
});
export const getActiveTargetReference = createSelector([getTargetReference], (t) => {
	return findActiveTargetReference(t.activeType,t);
});
export const getAddAllowed = createSelector([getActiveTargetReference], s => { 
	if (s) {
		for (const key in s) {
			if ((s as any)[key] === "undefined") {
				return false;
			}
		}
		return true;
	}
	return true;
});
export const getActiveReferenceGuide = createSelector([getTargetReference], (t) => {
	if (t.activeType !== "guide") { return "undefined";}
	return t.guide.guide;
});
export const getActiveReferencePath = createSelector([getTargetReference], (t) => {
	if (t.activeType !== "path") { return "undefined";}
	return t.path.path;
});
export const getActiveReferenceChannel = createSelector([getTargetReference], (t) => {
	if (t.activeType !== "channel") { return "undefined";}
	return t.channel.channel;
});
export const getActiveReferenceActionSet = createSelector([getTargetReference], (t) => {
	if (t.activeType !== "action") { return "undefined";}
	return t.action.actionset;
});
export const getActiveReferenceActionItem = createSelector([getTargetReference], (t) => {
	if (t.activeType !== "action") { return "undefined";}
	return t.action.action;
});
export const getActiveReferenceCommand = createSelector([getTargetReference], (t) => {
	if (t.activeType !== "action") { return "undefined";}
	return t.action.command;
});

export const getActiveDescriptorContent = createSelector([all], s => {
	const selected = s.descriptors.filter(d => d.selected);
	if (selected.length === 0) {
		return "Select 1 descriptor";
	} else if (selected.length > 1) {
		return "Select 1 descriptor";
	} else {
		return JSON.stringify(selected[0].originalData,null,3);
	}
});

export function findActiveTargetReference(activeType:TTargetReference,t:ITargetReference):TActiveTargetReference{
	switch (activeType) {
		case "action":
			return t.action;
		case "allFromGenerator":
			return t.allFromGenerator;
		case "featureData":
			return t.featureData;
		case "application":
			return t.application;
		case "channel":
			return t.channel;
		case "document":
			return t.document;
		case "guide":
			return t.guide;
		case "history":
			return t.history;
		case "layer":
			return t.layer;
		case "path":
			return t.path;
		case "snapshot":
			return t.snapshot;
		default:
			return null;
	}
}

// action

