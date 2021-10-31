import { createSelector } from "reselect";
import { IRootState } from "../shared/store";

import { IEntrypointCommand, IEntrypointPanel, ISorcererState } from "./sorModel";

export const all = (state:IRootState):ISorcererState => state.inspector.sorcerer;
export const getManifestGeneric = createSelector([all], s => s.manifestInfo);


export const getAllSnippets = createSelector([all], s => {	
	return s.snippets.list;
});

export const getActiveSnippet = createSelector([all, getAllSnippets], (s,snippets) => {
	if (s.selectedItem.kind !== "snippet" || typeof s.selectedItem.uuid !== "string") {
		return null;
	}
	const res = snippets.find(item => item.$$$uuid === s.selectedItem.uuid) || null;
	return res;
});

export const getAllEntryPoints = createSelector([all], s => {
	return s.manifestInfo.entrypoints;
});

export const getActiveCommand = createSelector([all, getAllEntryPoints], (s, entryPoints) => {
	if (s.selectedItem.kind !== "command" || typeof s.selectedItem.uuid !== "string") {
		return null;
	}

	const res:IEntrypointCommand |null = entryPoints.find(item => item.$$$uuid === s.selectedItem.uuid && item.type === "command") as IEntrypointCommand || null;
	return res;
});

export const getActivePanel = createSelector([all, getAllEntryPoints], (s, entryPoints) => {
	if (s.selectedItem.kind !== "panel" || typeof s.selectedItem.uuid !== "string") {
		return null;
	}

	const res = entryPoints.find(item => item.$$$uuid === s.selectedItem.uuid && item.type === "panel") as IEntrypointPanel || null;
	return res;
});


export const getAllCommands = createSelector([getAllEntryPoints], s => {
	const res: IEntrypointCommand[] = s.filter(item => item.type === "command") as IEntrypointCommand[];
	return res;
});

export const getAllPanels = createSelector([getAllEntryPoints], s => {
	const res: IEntrypointPanel[] = s.filter(item => item.type === "panel") as IEntrypointPanel[];
	return res;
});

export const isGenericModuleVisible = createSelector([all], s => {
	const res = s.selectedItem.kind === "general";
	return res;
});

export const getActiveItem = createSelector([getActiveSnippet, getActiveCommand, getActiveCommand, getActivePanel, isGenericModuleVisible],(activeSnippet, activeEntryPoint, activeCommand, activePanel, genericModuleVisible) => {
	const res = activeSnippet || activeEntryPoint || activeCommand || activePanel || (genericModuleVisible ? {type:"general"} : null);
	return res;
});
