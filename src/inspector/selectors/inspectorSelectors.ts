import { createSelector } from "reselect";
import { IRootState } from "../../shared/store";
import { IDescriptor } from "../model/types";
import { cloneDeep } from "lodash";
import { GetDOM } from "../classes/GetDOM";
import { Descriptor } from "photoshop/dist/types/UXP";
import { ITargetReferenceAM } from "../classes/GetInfo";

const all = (state:IRootState) => state.inspector;
 
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

// will exclude undefined objects in array
export const getActiveTargetReferenceForAM = createSelector([getTargetReference, getSelectedTargetReference], (targets, selected) => {
	const result = targets?.find(item => item.type === selected);
	if (!result) { return null; }
	const newRes = {
		...result,
		data: result.data.filter(ref => ref.content.value !== "")
	};
	return (newRes || null);
});

export const getAddAllowed = createSelector([getActiveTargetReference], s => { 
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
export const getDescriptorsListView = createSelector([getAllDescriptors, getActiveTargetReference, getFilterBySelectedReferenceType,getInspectorSettings], (allDesc, activeRefFilter, rootFilter,settings) => {	
	
	const pinned = allDesc.filter(i => i.pinned);
	const notPinned = allDesc.filter(i => !i.pinned);
	let reordered = [...notPinned, ...pinned];
	const { searchTerm } = settings;

	if (searchTerm) {
		reordered = reordered.filter(item => (item.title.toLowerCase().includes(searchTerm.toLowerCase())));
	} 

	// add one search here... perhaps generate name and store it in redux store so it can be used in search

	if (rootFilter === "off" && activeRefFilter?.type !== "listener") {
		return reordered;
	}

	let filtered = reordered.filter((desc: IDescriptor) => {
		if (rootFilter === "off") { return true;}
		const origRefFilter = desc.originalReference;
		if (activeRefFilter?.type !== origRefFilter.type) {
			return false;
		}
		for (let i = 0, len = activeRefFilter.data.length; i < len; i++) {
			if (activeRefFilter.data[i].content.filterBy === "off") {
				return true;
			}
			if (activeRefFilter.data[i].content.value !== origRefFilter.data[i].content.value) {
				return false;
			}
		}
		return true;
	});
	if (activeRefFilter?.type === "listener") {
		if (settings.listenerFilterType === "exclude" && settings.listenerExclude.join(";").trim().length) {
			filtered = filtered.filter(item => 
				!settings.listenerExclude.some(str => (item.originalData as Descriptor)?._obj?.includes(str.trim()))
			);
		} else if (settings.listenerFilterType === "include" && settings.listenerInclude.join(";").trim().length) {
			filtered = filtered.filter(item => 
				settings.listenerInclude.some(str => (item.originalData as Descriptor)?._obj?.includes(str.trim()))
			);
		}
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

export const getAutoSelectedIDs = createSelector([getAutoActiveDescriptor, getSecondaryAutoActiveDescriptor], (first,second) => {
	const f = first?.id;
	const s = second?.id;
	const result: string[] = [];
	if (f) { result.push(f); }
	if (s) { result.push(s); }
	
	return result;
});

export const getHasAutoActiveDescriptor = createSelector([getAutoActiveDescriptor], d => {
	return !!d;
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

export const getActiveDescriptorOriginalReference =createSelector([getActiveDescriptors, getAutoActiveDescriptor], (selected, autoActive) => {
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

export const getActiveTargetReferenceListenerCategory = createSelector([getActiveTargetReference], (t) => {
	if (!t) { return null;}
	const result = t.data.find(i => i.subType === "listenerCategory")?.content;

	return (result===undefined) ? null : result;
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

// inspector

export const getInspectorContentTab = createSelector([all], t => {
	return t.inspector.content;
});

export const getInspectorDomTab = createSelector([all], t => {
	return t.inspector.dom;
});

export const getInspectorDifferenceTab = createSelector([all],t=>{
	return t.inspector.difference;
});

export const getDiffPath = createSelector([getInspectorDifferenceTab],t=>{
	return t.treePath;
});

export const getContentPath = createSelector([getInspectorContentTab], t => {
	return t.treePath;
});

export const getDomPath = createSelector([getInspectorDomTab], t => {
	return t.treePath;
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

export const getTreeDom = createSelector([getSelectedDescriptors, getDomPath, getSelectedTargetReference, getAutoActiveDescriptor], (selectedDesc, domPath, mainClass, autoSelectedDesc) => {
	
	if ((!selectedDesc.length && !autoSelectedDesc) || mainClass === "listener") {
		return {
			ref: null,
			path: []
		};
	}
	const ref = {
		// selected desc or auto selected
		ref: (selectedDesc?.[0]?.calculatedReference as ITargetReferenceAM)?._target ?? (autoSelectedDesc ?.calculatedReference as ITargetReferenceAM)?._target,
		path: domPath
	};
	return ref;
});

export const getTreeDomInstance = createSelector([getTreeDom], (t) => {
	if (t.ref) {
		let sub:any = GetDOM.getDom(t.ref);
		
		const paths = t.path;
		for (const part of paths) {
			sub = (sub)?.[part];
		}
		return sub;	
	}
});

export const getContentExpandedNodes = createSelector([getInspectorContentTab], (t) => {	
	return t.expandedTree;
});
export const getDomExpandedNodes = createSelector([getInspectorDomTab], (t) => {	
	return t.expandedTree;
});
export const getDiffExpandedNodes = createSelector([getInspectorDifferenceTab], (t) => {	
	return t.expandedTree;
});

export const getActiveDescriptorCalculatedReference = createSelector([getActiveDescriptors, getAutoActiveDescriptor, getContentPath], (selected, autoActive, treePath) => {
	if (selected.length >= 1 || autoActive) {
		let data;
		if (selected.length >= 1) {
			data = selected.map(item => item.calculatedReference);
		} else if (autoActive) {
			data = [autoActive.calculatedReference];
		}
		
		let str = JSON.stringify(data, null, 3);
		str =
			"const photoshop = require(\"photoshop\");\n" +
			"\n" +
			"const result = photoshop.action.batchPlay(\n" +
			str +

			", {\n" +
			"   synchronousExecution: true\n" +
			"});\n";
	
		if (treePath.length) {
			// eslint-disable-next-line quotes
			str = `${str}const pinned = result["${treePath.join(`"]["`)}"];`;			
		}
		return str;
	} else {
		return "Add some descriptor";
	}
});

export const getDispatcherSnippet = createSelector([all], (all) => {
	return all.dispatcher.snippets[0].content;
});