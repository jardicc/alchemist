import type {PayloadAction} from "@reduxjs/toolkit";
import {inspectorSlice} from "../inspectorSlice";

// Re-export the action creators with their original public names. Each
// preserves the historical positional-argument signature via the slice's
// `prepare` callbacks – payload shapes are identical to the pre-RTK code.

export const setModeTabAction = inspectorSlice.actions.setModeTab;
export const setTargetReferenceAction = inspectorSlice.actions.setTargetReference;
export const addDescriptorAction = inspectorSlice.actions.addDescriptor;
export const selectDescriptorAction = inspectorSlice.actions.selectDescriptor;
export const setSelectedReferenceTypeAction = inspectorSlice.actions.setSelectedReferenceType;
export const setProperty = inspectorSlice.actions.setProperty;
export const clearViewAction = inspectorSlice.actions.clearView;
export const clearAction = inspectorSlice.actions.clear;
export const clearNonExistentAction = inspectorSlice.actions.clearNonExistent;
export const lockDescAction = inspectorSlice.actions.lockDesc;
export const pinDescAction = inspectorSlice.actions.pinDesc;
export const removeDescAction = inspectorSlice.actions.removeDesc;
export const importStateAction = inspectorSlice.actions.importState;
export const importItemsAction = inspectorSlice.actions.importItems;
export const importReplaceAction = inspectorSlice.actions.importReplace;
export const exportSelectedDescAction = inspectorSlice.actions.exportSelectedDesc;
export const exportAllDescAction = inspectorSlice.actions.exportAllDesc;
export const exportStateAction = inspectorSlice.actions.exportState;
export const setInspectorPathDiffAction = inspectorSlice.actions.setInspectorPathDiff;
export const setInspectorPathContentAction = inspectorSlice.actions.setInspectorPathContent;
export const setInspectorPathDomAction = inspectorSlice.actions.setInspectorPathDom;
export const setFilterStateAction = inspectorSlice.actions.setFilterState;
export const setListenerAction = inspectorSlice.actions.setListener;
export const setAutoInspectorAction = inspectorSlice.actions.setAutoInspector;
export const setSpyAction = inspectorSlice.actions.setSpy;
export const setExpandedPathAction = inspectorSlice.actions.setExpandedPath;
export const setSearchTermAction = inspectorSlice.actions.setSearchTerm;
export const setListenerNotifierFilterAction = inspectorSlice.actions.setListenerNotifierFilter;
export const filterEventNameAction = inspectorSlice.actions.filterEventName;
export const setDispatcherValueAction = inspectorSlice.actions.setDispatcherValue;
export const renameDescriptorAction = inspectorSlice.actions.renameDescriptor;
export const setRenameModeAction = inspectorSlice.actions.setRenameMode;
export const setDescriptorOptionsAction = inspectorSlice.actions.setDescriptorOptions;
export const toggleSettingsAction = inspectorSlice.actions.toggleSettings;
export const setInspectorViewAction = inspectorSlice.actions.setInspectorView;
export const setColumnSizeAction = inspectorSlice.actions.setColumnSize;
export const setRecordRawAction = inspectorSlice.actions.setRecordRaw;
export const setAutoExpandLevelAction = inspectorSlice.actions.setAutoExpandLevel;
export const setMaximumItems = inspectorSlice.actions.setMaximumItems;
export const setDontShowMarketplaceInfoAction = inspectorSlice.actions.setDontShowMarketplaceInfo;
export const setFontSizeAction = inspectorSlice.actions.setFontSize;
export const setNeverRecordActionNamesAction = inspectorSlice.actions.setNeverRecordActionNames;
export const toggleDescriptorsGroupingAction = inspectorSlice.actions.toggleDescriptorsGrouping;
export const setSettingsAction = inspectorSlice.actions.setSettings;
export const toggleAccordion = inspectorSlice.actions.toggleAccordion;
export const setSearchContentKeywordAction = inspectorSlice.actions.setSearchContentKeyword;
export const setCategoryItemVisibilityAction = inspectorSlice.actions.setCategoryItemVisibility;

// Union of all action shapes dispatched against the inspector slice.
// Kept for type compatibility with components that historically typed
// their dispatch parameter as `Dispatch<TActions>`.
type _InspectorActions = typeof inspectorSlice.actions;
export type TActions = ReturnType<_InspectorActions[keyof _InspectorActions]> | PayloadAction<any>;
