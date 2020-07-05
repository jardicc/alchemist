import { createStore, applyMiddleware } from "redux";
import { listenerReducer } from "../reducers";
import { composeWithDevTools } from "redux-devtools-extension";

/*
 * We're giving State interface to create store
 * store is type of State defined in our reducers
 */


const composeEnhancers = composeWithDevTools({
	// Specify name here, actionsBlacklist, actionsCreators and other options if needed
});
export const listenerStore = createStore(listenerReducer, /* preloadedState, */ composeEnhancers(
	applyMiddleware(),
	// other store enhancers if any
));