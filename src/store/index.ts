import { createStore, applyMiddleware } from "redux";
import { appReducer } from "../reducers";
import { composeWithDevTools } from "redux-devtools-extension";

/*
 * We're giving State interface to create store
 * store is type of State defined in our reducers
 */


const composeEnhancers = composeWithDevTools({
	// Specify name here, actionsBlacklist, actionsCreators and other options if needed
});
export const store = createStore(appReducer, /* preloadedState, */ composeEnhancers(
	applyMiddleware(),
	// other store enhancers if any
));