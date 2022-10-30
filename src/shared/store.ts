import { legacy_createStore as createStore, applyMiddleware, combineReducers } from "redux";
import { inspectorReducer } from "../inspector/reducers/reducer";
import { IInspectorState } from "../inspector/model/types";

/*
 * We're giving State interface to create store
 * store is type of State defined in our reducers
 */

export interface IRootState {
	inspector: IInspectorState;
}

const rootReducer = combineReducers<IRootState>({
	inspector:inspectorReducer,
	//atnConverter: atnConverterReducer
});
export const rootStore = createStore(rootReducer, /* preloadedState, */applyMiddleware());
console.log(rootStore.getState());

(window as any)._rootStore = rootStore;