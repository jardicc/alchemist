import { createSelector } from "reselect";
import { IRootState } from "../shared/store";

import { ISorcererState } from "./sorModel";

export const all = (state:IRootState):ISorcererState => state.inspector.sorcerer;
export const getManifestGeneric = createSelector([all], s => s.manifestInfo);

export const getActiveSnippet = createSelector([all], s => {

	if (s.selectedItem.kind !== "snippet" || typeof s.selectedItem.index !== "number") {
		return null;
	}

	return s.snippets.list[s.selectedItem.index];
});

export const getActiveEntryPoint = createSelector([all], s => {

	if (s.selectedItem.kind !== "entryPoint" || typeof s.selectedItem.index !== "number") {
		return null;
	}

	return s.manifestInfo.entrypoints[s.selectedItem.index];
});

export const getActiveCommand = createSelector([getActiveEntryPoint], s => {

	if (!s || s.type!=="command") { return null; }
	
	return s;
});

