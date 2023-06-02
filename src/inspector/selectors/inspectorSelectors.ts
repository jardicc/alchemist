/* eslint-disable comma-dangle */
import { createSelector } from "reselect";
import { IRootState } from "../../shared/store";
import { IDescriptor, IInspectorState, IListenerNotifierFilter, TSubTypes, TTargetReference } from "../model/types";
import { Helpers } from "../classes/Helpers";
import { cloneDeep, isEqual } from "lodash";
import { ActionDescriptor } from "photoshop/dom/CoreModules";

export const all = (state:IRootState):IInspectorState => state.inspector;
 
export const getModeTabID = createSelector([all], s => s.inspector.activeTab);

export const getSelectedTargetReference = createSelector([all], s => s.selectedReferenceType);
export const getFilterBySelectedReferenceType = createSelector([all], s => s.filterBySelectedReferenceType);
export const getTargetReference = createSelector([all], s => s.targetReference);
export const getAutoUpdate = createSelector([all],s=>s.settings.autoUpdateInspector);
export const getAllDescriptors = createSelector([all], s => s.descriptors);
export const getSelectedDescriptors = createSelector([all], s => s.descriptors.filter((d) => d.selected === true));
export const getSelectedDescriptorsUUID = createSelector([getSelectedDescriptors], s => s.map(d => d.id));
export const getPropertySettings = createSelector([all],s=>s.settings.properties);
export const getLockedSelection = createSelector([getSelectedDescriptors], s => s.some(d => d.locked));
export const getPinnedSelection = createSelector([getSelectedDescriptors], s => s.some(d => d.pinned));
export const getRemovableSelection = createSelector([getLockedSelection], s => !s);

export const getActiveRef = createSelector([getTargetReference, getSelectedTargetReference], (targets, selected) => {
	switch (selected) {
		case "listener": return targets.listener;
		case "dispatcher": return targets.dispatcher;
		case "notifier": return targets.notifier;
		case "replies": return targets.replies;
		case "generator": return targets.generator;
		case "application": return targets.application;
		case "document": return targets.document;
		case "layer": return targets.layer;
		case "path": return targets.path;
		case "channel": return targets.channel;
		case "actions": return targets.actions; //
		case "timeline": return targets.timeline;
		case "animationFrameClass": return targets.animationFrameClass; //
		case "animationClass": return targets.animationClass; //
		case "historyState": return targets.historyState; //
		case "snapshotClass": return targets.snapshotClass; //
		case "guide": return targets.guide;
		default: {
			const exhaustiveCheck: never = selected;
			throw new Error(exhaustiveCheck);
		}
	}
});

export const getCategoryItemsVisibility = createSelector([all, getActiveRef], (s, activeRef) => {
	// adds currently selected category into visibility even though is not explicitly set to visible
	const res: TTargetReference[] = [...new Set([...s.explicitlyVisibleTopCategories, activeRef.type])];
	return res;
});

export const getInspectorSettings = createSelector([all], (s) => {
	return s.settings;
});

export const getFontSizeSettings = createSelector([getInspectorSettings], (s) => {
	return s.fontSize;
});

export const getSettingsVisible = createSelector([getInspectorSettings], (s) => {
	return s.settingsVisible;
});

export const getLeftColumnWidth = createSelector([getInspectorSettings], (s) => {
	return s.leftColumnWidthPx;
});

export const getRightColumnWidth = createSelector([getInspectorSettings], (s) => {
	return s.rightColumnWidthPx;
});

export const getPropertiesListForActiveRef = createSelector([getPropertySettings, getActiveRef], (propertySettings, activeRef) => {
	const foundSettings = propertySettings.find(p => p.type === activeRef.type);
	return foundSettings;
});

export const getNeverRecordActionNames = createSelector([getInspectorSettings], s => s.neverRecordActionNames);

// will exclude undefined objects in array
/*
export const getActiveTargetReferenceForAM = createSelector([getActiveRef], (activeRef) => {
	const newRes = {
		...result,
		data: result.data.filter(ref => ref.content.value !== ""),
	};
	return (newRes || null);
});
*/

export const getListenerNotifierFilterSettings = createSelector([all], (all) => {
	if (all.selectedReferenceType === "listener") {
		return all.settings.listenerFilter;
	} else if (all.selectedReferenceType === "notifier") {
		return all.settings.notifierFilter;
	}
	throw Error("Wrong type in filter");
});

export const getDescriptorsListView = createSelector([
	getAllDescriptors,
	getActiveRef,
	getFilterBySelectedReferenceType,
	getInspectorSettings,
	getCategoryItemsVisibility,
], (
	allDesc,
	activeRef,
	rootFilter,
	settings,
	visibleMainCategories,
) => {	
	const pinned:IDescriptor[] = allDesc.filter(i => i.pinned);
	const notPinned: IDescriptor[] = allDesc.filter(i => !i.pinned);
	let reordered = [...notPinned, ...pinned];
	const { searchTerm,listenerFilter,notifierFilter } = settings;

	if (searchTerm) {
		reordered = reordered.filter(item => (item.title.toLowerCase().includes(searchTerm.toLowerCase())));
	} 

	/*
	if (rootFilter === "off" && activeRefFilter.type !== "listener") {
		// handle this!!
		return reordered;
	}
	*/

	//let filtered: IDescriptor[] = reordered;

	
	let filtered = reordered.filter((desc: IDescriptor) => {
		// show all if none filter is active
		if (rootFilter === "off") {
			return true;
		}
	
		// hide items from inactive categories
		if (!visibleMainCategories.includes(desc.originalReference.type)) {
			return false;
		}

		// skip categories with no further filter options... just to make it easier
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (activeRef.type) {
			case "generator":
			case "listener":
			case "dispatcher":
			case "notifier":
			case "replies":
				return true;
		}
		
		// order matter
		const filterClasses = [
			"filterDoc",
			"filterChannel",
			"filterPath",
			"filterLayer",
			"filterActionSet",
			"filterAction",
			"filterCommand",
			"filterGuide",
			"filterHistory",
			"filterSnapshot",
			"filterProp",
		] as const;
		
		// order matter
		const classes: TSubTypes[] = [
			"documentID",
			"channelID",
			"pathID",
			"layerID",
			"actionSetID",
			"actionID",
			"commandIndex",
			"guideID",
			"historyID",
			"snapshotID",
			"properties",
		];
		
		//console.log(desc.title, activeRef, origRefClone);
		const activeRefClone = cloneDeep(activeRef);
		const origRefClone = cloneDeep(desc.originalReference);
		// reduce properties only to those that matters and compare them
		filterClasses.forEach((className, index) => {
			if ((activeRefClone as any)?.[className] === "off") {
				delete (activeRefClone as any)[classes[index]];
				delete (origRefClone as any)[classes[index]];
			}
			delete (origRefClone as any)[className];
			delete (activeRefClone as any)[className];
		});
		// allows to compare when multiple main categories are set to be visible
		delete (origRefClone as any).type;
		delete (activeRefClone as any).type;
		console.log(desc.title,activeRefClone, origRefClone);
		return isEqual(activeRefClone, origRefClone);
	});

	if (activeRef.type === "listener" || activeRef.type === "notifier") {
		const filterSettings: IListenerNotifierFilter = (activeRef.type === "listener") ? listenerFilter : notifierFilter;
		if (filterSettings.type === "exclude" && filterSettings.exclude.join(";").trim().length) {
			filtered = filtered.filter(item => 
				!filterSettings.exclude.some(str => (item.recordedData as ActionDescriptor)?._obj?.includes(str.trim())),
			);
		} else if (filterSettings.type === "include" && filterSettings.include.join(";").trim().length) {
			filtered = filtered.filter(item => 
				filterSettings.include.some(str => (item.recordedData as ActionDescriptor)?._obj?.includes(str.trim())),
			);
		}
	}

	if (settings.groupDescriptors === "strict") {
		filtered = cloneDeep(filtered);
		filtered.reverse();
	
		// group (remove) duplicates
		for (let i = 0; i < filtered.length-1; i++) {
			const element = filtered[i];
			for (let j = i+1; j < filtered.length; j++) {
				const next = filtered[j];
				if (next.crc === element.crc) {
					filtered.splice(j, 1);
					j -= 1;
					element.groupCount = (!element.groupCount) ? 2 : element.groupCount+1;
				}
			}
		}
		
		filtered.reverse();
	}


	return filtered;
});

export const getActiveDescriptors = createSelector([all], s => {
	const selected = s.descriptors.filter(d => d.selected);
	return selected;
});

export const getAutoActiveDescriptor = createSelector([getActiveDescriptors, getDescriptorsListView], (activeDescs, view) => {
	const list = view;//.filter(item => !item.pinned);
	if (activeDescs.length === 0) {
		if (list.length) {
			return list[list.length-1];			
		}
	}
	return null;
});

export const getSecondaryAutoActiveDescriptor = createSelector([getActiveDescriptors, getDescriptorsListView], (activeDescs, view) => {
	const list = view;//.filter(item => !item.pinned);
	if (activeDescs.length === 0) {
		if (list.length >= 2) {
			return list[list.length-2];
		}
	}
	return null;
});

export const getAutoSelectedUUIDs = createSelector([getAutoActiveDescriptor, getSecondaryAutoActiveDescriptor,getModeTabID], (first,second,mode) => {
	const f = first?.id;
	const s = (mode==="difference") ? second?.id : null;
	const result: string[] = [];
	if (f) { result.push(f); }
	if (s) { result.push(s); }
	
	return result;
});

export const getHasAutoActiveDescriptor = createSelector([getAutoActiveDescriptor], d => {
	return !!d;
});

export const getActiveDescriptorOriginalReference = createSelector([getActiveDescriptors, getAutoActiveDescriptor], (selected, autoActive) => {
	if (selected.length > 1) {
		return "Select 1 descriptor";
	} else if (selected.length === 1) {
		return JSON.stringify(selected[0].originalReference, null, 3);
	} else if (autoActive) {
		return JSON.stringify(autoActive.originalReference, null, 3);
	} else {
		return "Add some descriptor";
	}
});

export const getReplayEnabled = createSelector([getActiveDescriptors], (selected) => {

	if (selected.length < 1) {
		return false;
	}
	if (selected.some(item => ["replies", "dispatcher"].includes(item.originalReference.type))) {
		return false;
	}
	return true;
});

export const getCopyToClipboardEnabled = createSelector([getReplayEnabled], (enabled) => {
	return enabled;
});

export const getRanameEnabled = createSelector([getDescriptorsListView], (all) => {
	const selected = all.filter(d => d.selected);
	if (selected?.length !== 1) {
		return false;
	}
	return (!selected[0].groupCount || selected[0].groupCount === 1);
});

export const getAddAllowed = createSelector([getActiveRef], (activeRef) => {
	if ("properties" in activeRef && activeRef.properties.includes("none")) {
		return false;
	}
	if (activeRef.type === "generator") {
		return true;
	}
	if ((["listener", "dispatcher", "notifier", "replies"] as TTargetReference[]).includes(activeRef.type)) {
		return false;
	}
	if (activeRef.type === "guide" && activeRef.guideID === "none") {
		return false;
	}
	if (activeRef.type === "actions" && activeRef.actionSetID === "none") {
		return false;
	}
	return true;
});