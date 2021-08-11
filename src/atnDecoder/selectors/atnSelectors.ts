import { createSelector } from "reselect";
import { IATNConverterState } from "../../inspector/model/types";
import { IRootState } from "../../shared/store";

export const all = (state:IRootState):IATNConverterState => state.inspector.atnConverter;
export const getData = createSelector([all], s => s.data);