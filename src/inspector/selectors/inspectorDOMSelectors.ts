import { createSelector } from "reselect";
import { GetDOM } from "../classes/GetDOM";
import { ITargetReferenceAM } from "../classes/GetInfo";
import { all, getSelectedDescriptors, getSelectedTargetReference, getAutoActiveDescriptor } from "./inspectorSelectors";

export const getInspectorDomTab = createSelector([all], t => {
	return t.inspector.dom;
});

export const getDomPath = createSelector([getInspectorDomTab], t => {
	return t.treePath;
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

export const getDomExpandedNodes = createSelector([getInspectorDomTab], (t) => {	
	return t.expandedTree;
});

export const getDOMExpandLevel = createSelector([getInspectorDomTab], (t) => {
	return t?.autoExpandLevels ?? 0;
});