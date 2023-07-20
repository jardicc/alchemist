import { createSelector } from "reselect";
import { all } from "./inspectorSelectors";

export const getDispatcherSnippet = createSelector([all], (all) => {
  return all.dispatcher.snippets[0].content;
});
