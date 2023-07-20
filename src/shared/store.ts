import {
  legacy_createStore as createStore,
  applyMiddleware,
  combineReducers,
} from "redux";
import { reducer } from "../inspector/reducers/reducer";
import { IInspectorState } from "../inspector/model/types";

/*
 * We're giving State interface to create store
 * store is type of State defined in our reducers
 */

export interface IRootState {
  inspector: IInspectorState;
}

const rootReducer = combineReducers<IRootState>({
  inspector: reducer,
});

export const rootStore = createStore(rootReducer, applyMiddleware());
console.log(rootStore.getState());

window._rootStore = rootStore;
