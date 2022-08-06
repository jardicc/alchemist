import { createSelector } from "reselect";
import { IRootState } from "../../shared/store";
import { IDescriptor, IInspectorState } from "../model/types";
import { Helpers } from "../classes/Helpers";
import { cloneDeep } from "lodash";
import { ActionDescriptor } from "photoshop/dom/CoreModules";

export const all = (state:IRootState):IInspectorState => state.inspector;
 
export const getMainTabID = createSelector([all], s => s.activeSection);
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

export const getActiveTargetReference = createSelector([getTargetReference, getSelectedTargetReference], (targets, selected) => {
	const result = targets?.find(item => item.type === selected);
	return (result || null);
});



export const getInspectorSettings = createSelector([all], (s) => {
	return s.settings;
});

export const getFontSizeSettings = createSelector([getInspectorSettings], (s) => {
	return s.fontSize;
});

export const getLeftColumnWidth = createSelector([getInspectorSettings], (s) => {
	return s.leftColumnWidthPx;
});

export const getNeverRecordActionNames = createSelector([getInspectorSettings], s => s.neverRecordActionNames);

// will exclude undefined objects in array
export const getActiveTargetReferenceForAM = createSelector([getTargetReference, getSelectedTargetReference], (targets, selected) => {
	const result = targets?.find(item => item.type === selected);
	if (!result) { return null; }
	const newRes = {
		...result,
		data: result.data.filter(ref => ref.content.value !== ""),
	};
	return (newRes || null);
});

export const getDescriptorsListView = createSelector([getAllDescriptors, getActiveTargetReference, getFilterBySelectedReferenceType,getInspectorSettings], (allDesc, activeRefFilter, rootFilter,settings) => {	
	const pinned = allDesc.filter(i => i.pinned);
	const notPinned = allDesc.filter(i => !i.pinned);
	let reordered = [...notPinned, ...pinned];
	const { searchTerm } = settings;

	if (searchTerm) {
		reordered = reordered.filter(item => (item.title.toLowerCase().includes(searchTerm.toLowerCase())));
	} 

	/*
	if (rootFilter === "off" && activeRefFilter?.type !== "listener") {
		// handle this!!
		return reordered;
	}
	*/

	//let filtered: IDescriptor[] = reordered;

	
	let filtered = reordered.filter((desc: IDescriptor) => {
		if (rootFilter === "off") {
			return true;
		}
	
		const origRefFilter = desc.originalReference;
		if (activeRefFilter?.type !== origRefFilter.type) {
			return false;
		}
		if (activeRefFilter?.type !== "listener") {
			for (let i = 0, len = activeRefFilter.data.length; i < len; i++) {
				if (activeRefFilter.data[i].content.filterBy === "off") {
					return true;
				}
				if (activeRefFilter.data[i].content.value !== origRefFilter.data[i].content.value) {
					return false;
				}
			}
		}
		return true;
	});
	if (activeRefFilter?.type === "listener") {
		if (settings.listenerFilterType === "exclude" && settings.listenerExclude.join(";").trim().length) {
			filtered = filtered.filter(item => 
				!settings.listenerExclude.some(str => (item.originalData as ActionDescriptor)?._obj?.includes(str.trim())),
			);
		} else if (settings.listenerFilterType === "include" && settings.listenerInclude.join(";").trim().length) {
			filtered = filtered.filter(item => 
				settings.listenerInclude.some(str => (item.originalData as ActionDescriptor)?._obj?.includes(str.trim())),
			);
		}
	}

	console.log("!!!");

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
export const getActiveReferenceProperty = createSelector([getActiveTargetReference], (t) => {	
	return t?.data.find(i => i.subType === "property")?.content;	
});
export const getActiveReferenceGuide = createSelector([getActiveTargetReference], (t) => {
	return t?.data.find(i => i.subType === "guide")?.content;
});
export const getActiveReferencePath = createSelector([getActiveTargetReference], (t) => {
	return t?.data.find(i => i.subType === "path")?.content;
});
export const getActiveReferenceChannel = createSelector([getActiveTargetReference], (t) => {
	return t?.data.find(i => i.subType === "channel")?.content;
});
export const getActiveReferenceActionSet = createSelector([getActiveTargetReference], (t) => {
	return t?.data.find(i => i.subType === "actionset")?.content;
});
export const getActiveReferenceActionItem = createSelector([getActiveTargetReference], (t) => {
	return t?.data.find(i => i.subType === "action")?.content;
});
export const getActiveReferenceCommand = createSelector([getActiveTargetReference], (t) => {
	return t?.data.find(i => i.subType === "command")?.content;
});
export const getActiveReferenceHistory = createSelector([getActiveTargetReference], (t) => {
	return t?.data.find(i => i.subType === "history")?.content;
});
export const getActiveReferenceSnapshot = createSelector([getActiveTargetReference], (t) => {
	return t?.data.find(i => i.subType === "snapshot")?.content;
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

/*
export const getPlayableReference = createSelector([getActiveDescriptorCalculatedReference], (reference) => {
	if (selected.length > 1) {
		return "Select 1 descriptor";
	} else if (selected.length === 1) {
		return JSON.stringify(selected[0].calculatedReference, null, 3);		
	} else if (autoActive) {
		return JSON.stringify(autoActive.calculatedReference, null, 3);
	} else {
		return "Add some descriptor";
	}	
});*/

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


export const getActiveTargetDocument = createSelector([getActiveTargetReference], (t) => {
	if (!t) { return null;}
	const result = t.data.find(i => i.subType === "document")?.content;

	return (result===undefined) ? null : result;
});

export const getActiveTargetLayer = createSelector([getActiveTargetReference], (t) => {
	if (!t) { return null;}
	const result = t.data.find(i => i.subType === "layer")?.content;

	return (result===undefined) ? null : result;
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

export const getAddAllowed = createSelector([getActiveTargetReference, getActiveReferenceProperty], (s, property) => { 
	if (property?.value === "") {
		return false;
	}
	if (s) {
		if (s.type === "generator") {
			return true;
		}
		if (s.type === "listener") {
			return false;
		}
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

/*export const getColumnSizesPercentage = createSelector([getInspectorSettings], (s) => {
	debugger;
	const leftColumnPerc = Helpers.pxToPanelWidthPercentage("inspector", s.leftColumnWidthPx);

	return [leftColumnPerc,100-leftColumnPerc] as [number,number];
});*/