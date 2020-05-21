import { createSelector } from 'reselect'
import { IAppState } from '../reducers/initialState'

const all = (state:IAppState) => state
 
export const getCollapsedDefault = createSelector([all], s => s.settings.collapsed);
export const getBatchPlayDecorator = createSelector([all], s => s.settings.batchPlayDecorator);
export const getSettings = createSelector([all], s => s.settings);
export const getFilterType = createSelector([all], s => s.filter.filterEventsType);
export const getInclude = createSelector([all], s => s.filter.include.join(";"));
export const getExclude = createSelector([all], s => s.filter.exclude.join(";"));
export const getActions = createSelector([all], s => {
	let actions = s.actions;
	if (s.filter.filterEventsType === "exclude") {
		actions = actions.filter(action => 
			!s.filter.exclude.some(str => action.title.includes(str))
		)
	} else if (s.filter.filterEventsType === "include") {
		actions = actions.filter(action => 
			s.filter.include.some(str => action.title.includes(str))
		)
	}


	if (s.filter.searchTerm) {
		return actions.filter(action => action.title.includes(s.filter.searchTerm as string))
	} else {
		return actions
	}
});

// action

