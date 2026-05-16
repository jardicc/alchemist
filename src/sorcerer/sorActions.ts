import type {PayloadAction} from "@reduxjs/toolkit";
import {sorSlice} from "./sorSlice";

export {
	type TSetMainActionPayload,
	type TSetSnippetActionPayload,
	type TSetPanelActionPayload,
	type TSetCommandActionPayload,
	type TSetPanelHostActionPayload,
} from "./sorSlice";

export const setPresetAction = sorSlice.actions.setPreset;
export const setSelectAction = sorSlice.actions.select;
export const makeAction = sorSlice.actions.make;
export const removeAction = sorSlice.actions.remove;
export const setMainAction = sorSlice.actions.setMain;
export const setPanelAction = sorSlice.actions.setPanel;
export const setCommandAction = sorSlice.actions.setCommand;
export const setSnippetAction = sorSlice.actions.setSnippet;
export const assignSnippetToPanelAction = sorSlice.actions.assignSnippetToPanel;
export const setHostApp = sorSlice.actions.setHostApp;

type _SorActions = typeof sorSlice.actions;
export type TSorActions = ReturnType<_SorActions[keyof _SorActions]> | PayloadAction<any, string>;
