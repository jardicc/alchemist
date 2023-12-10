import {AnyAction, EmptyObject, Store} from "redux";
import type {Main} from "../shared/classes/Main";
import {IRootState} from "../shared/store";

export { };

// we are adding useful properties into global window object so we will be able to debug more easily
declare global {
	interface Window {
		Main: Main;
		_rootStore: Store<EmptyObject & IRootState, AnyAction>
	}
}