import type {UnknownAction} from "@reduxjs/toolkit";
import {IInspectorState} from "../model/types";
import {inspectorSlice} from "../inspectorSlice";
import {atnSlice} from "../../atnDecoder/atnSlice";
import {sorSlice} from "../../sorcerer/sorSlice";
import {getInitialState} from "../inspInitialState";
import {Settings} from "../classes/Settings";

let _initialInspectorState: IInspectorState | null = null;
const getLazyInitialState = (): IInspectorState => {
	_initialInspectorState ??= Settings.importState() ?? getInitialState();
	return _initialInspectorState;
};

/**
 * Combined inspector reducer.
 *
 * Historically the inspector slice owned the full `IInspectorState` shape and
 * the atn/sor reducers piggy-backed on the same state (mutating
 * `state.atnConverter` / `state.sorcerer`). To keep behavior identical we run
 * all three slice reducers sequentially on the same state. Each slice ignores
 * actions it doesn't own and returns the state unchanged.
 *
 * The real initial state is computed lazily here (matching the original
 * default-parameter pattern in the legacy reducer) so that importing the
 * slice modules does not eagerly evaluate photoshop-dependent helpers.
 */
export const inspectorReducer = (state: IInspectorState | undefined, action: UnknownAction): IInspectorState => {
	state ??= getLazyInitialState();
	let next = inspectorSlice.reducer(state, action);
	next = atnSlice.reducer(next, action);
	next = sorSlice.reducer(next, action);
	return next;
};
