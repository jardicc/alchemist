import {configureStore, Middleware} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {inspectorReducer} from "../inspector/reducers/reducer";
import {IInspectorState} from "../inspector/model/types";
import {Settings} from "../inspector/classes/Settings";

/*
 * We're giving State interface to create store
 * store is type of State defined in our reducers
 */

export interface IRootState {
	inspector: IInspectorState;
}

const loggerMiddleware: Middleware<unknown, IRootState> = _storeAPI => next => action => {
	console.log(action);
	return next(action);
};

const saveSettingsMiddleware: Middleware<unknown, IRootState> = storeAPI => next => action => {
	const result = next(action);
	void Settings.saveSettings(storeAPI.getState().inspector); // Save settings after every action. No need to wait for it.
	return result;
};

export const rootStore = configureStore({
	reducer: {
		inspector: inspectorReducer,
	},
	middleware: (getDefault) => getDefault({
		serializableCheck: false,
		immutableCheck: false,
		thunk: false,
	}).concat(loggerMiddleware, saveSettingsMiddleware),
});
console.log(rootStore.getState());

window._rootStore = rootStore;

export type AppDispatch = typeof rootStore.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<IRootState> = useSelector;
