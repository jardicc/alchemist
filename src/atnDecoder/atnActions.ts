import type {PayloadAction} from "@reduxjs/toolkit";
import {atnSlice} from "./atnSlice";

export const setDontSendDisabledAction = atnSlice.actions.setDontSendDisabled;
export const passSelectedAction = atnSlice.actions.passSelected;
export const clearAllAction = atnSlice.actions.clearAll;
export const setDataAction = atnSlice.actions.setData;
export const setSelectActionAction = atnSlice.actions.selectAction;
export const setExpandActionAction = atnSlice.actions.expandAction;

type _AtnActions = typeof atnSlice.actions;
export type TAtnActions = ReturnType<_AtnActions[keyof _AtnActions]> | PayloadAction<any, string>;
