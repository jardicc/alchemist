import { AnyAction, EmptyObject, Store } from "redux";
import type { Main } from "../shared/classes/Main";
import { IRootState } from "../shared/store";

export {};

// we are adding useful properties into global window object so we will be able to debug more easily
declare global {
  interface Window {
    Main: Main;
    _rootStore: Store<EmptyObject & IRootState, AnyAction>;
  }

  namespace JSX {
    interface IntrinsicElements {
      "sp-menu-group": any;
      "sp-action-group": any;
      "sp-split-button": any;
      "sp-popover": any;
      "p-action-group>": any;
      "sp-action-menu": any;
      "sp-search": any;
      "sp-switch": any;
      "sp-tab": any;
      "sp-tab-list": any;
      "sp-tags": any;
      "sp-tag": any;
      "sp-tooltip": any;
    }
  }
}
