import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { inspectorReducer } from "../inspector/reducers";
import { IInspectorState } from "../inspector/model/types";

/*
 * We're giving State interface to create store
 * store is type of State defined in our reducers
 */

export interface IRootState{
	inspector: IInspectorState;
 }

const composeEnhancers = composeWithDevTools({
	// Specify name here, actionsBlacklist, actionsCreators and other options if needed
});

const rootReducer = combineReducers({
	inspector:inspectorReducer,
	//listener: listenerReducer
});
export const rootStore = createStore(rootReducer, /* preloadedState, */ composeEnhancers(
	applyMiddleware(),
	// other store enhancers if any
));
console.log(rootStore.getState());

(window as any)._rootStore = rootStore;