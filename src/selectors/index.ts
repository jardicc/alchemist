import { createSelector } from "reselect";
import { IAppState, IActionView } from "../reducers/initialState";
import _ from "lodash";

const all = (state:IAppState) => state;
 
export const getCollapsedDefault = createSelector([all], s => s.settings.collapsed);
export const getGroupSame = createSelector([all], s => s.filter.groupSame);
export const getBatchPlayDecorator = createSelector([all], s => s.settings.batchPlayDecorator);
export const getSettings = createSelector([all], s => s.settings);
export const getFilterType = createSelector([all], s => s.filter.filterEventsType);
export const getIncludeArr = createSelector([all], s => s.filter.include);
export const getExcludeArr = createSelector([all], s => s.filter.exclude);
export const getInclude = createSelector([getIncludeArr], s => s.join(";"));
export const getExclude = createSelector([getExcludeArr], s => s.join(";"));
export const getSearchEvent = createSelector([all], s => s.filter.searchTerm);
export const getActions = createSelector([all,getGroupSame], (s,groupSame) => {
	let actions: IActionView[] = s.actions.map(action => ({
		...action,
		groupedCounter:1
	}));
	
	if (s.filter.filterEventsType === "exclude" && s.filter.exclude.join(";").trim().length) {
		actions = actions.filter(action => 
			!s.filter.exclude.some(str => action.eventName.includes(str.trim()))
		);
	} else if (s.filter.filterEventsType === "include" && s.filter.include.join(";").trim().length) {
		actions = actions.filter(action => 
			s.filter.include.some(str => action.eventName.includes(str.trim()))
		);
	}
	if (s.filter.searchTerm) {
		actions = actions.filter(action => action.eventName.includes(s.filter.searchTerm as string));
	} 
	
	// reduce
	if (groupSame) {
		for (let i = 0; i < actions.length; i++) {
			for (let j = i+1; j < actions.length; j++) {
				if (
					actions[i].eventName === actions[j].eventName
					&&
					_.isEqual(actions[i].descriptor, actions[j].descriptor)
				) {
					// merge also replies
					actions[i].playReplies = [
						...actions[i].playReplies,
						...actions[j].playReplies,
					];
					actions.splice(j, 1);
					j--;
					actions[i].groupedCounter++;
				}			
			}			
		}
	}

	return actions as IActionView[];
});

// action

