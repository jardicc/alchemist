// maybe TODO

import { IATNConverterState } from "./atnModel";

export function getAtnInitialState(): IATNConverterState {
  return {
    data: [],
    expandedItems: [],
    selectedItems: [],
    lastSelected: null,
    dontSendDisabled: false,
  };
}
