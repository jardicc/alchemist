import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { inspectorReducer } from "./inspector/reducers";
import { listenerReducer } from "./listener/reducers";
import { IInspectorState } from "./inspector/reducers/initialStateInspector";
import { IAppState } from "./listener/reducers/initialStateListener";

/*
 * We're giving State interface to create store
 * store is type of State defined in our reducers
 */

export interface IRootState{
	inspector: IInspectorState;
	listener: IAppState;
 }

const composeEnhancers = composeWithDevTools({
	// Specify name here, actionsBlacklist, actionsCreators and other options if needed
});

const rootReducer = combineReducers({
	inspector:inspectorReducer,
	listener: listenerReducer
});
export const rootStore = createStore(rootReducer, /* preloadedState, */ composeEnhancers(
	applyMiddleware(),
	// other store enhancers if any
));
console.log(rootStore.getState());