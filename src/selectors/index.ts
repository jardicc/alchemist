import { createSelector } from 'reselect'
import { IAppState } from '../reducers/initialState'

const all = (state:IAppState) => state
 
export const getCollapsedDefault = createSelector([all], s => s.settings.collapsed);
export const getBatchPlayDecorator = createSelector([all], s => s.settings.batchPlayDecorator);
export const getSettings = createSelector([all], s => s.settings);
export const getActions = createSelector([all], s => {
	if (s.filter.searchTerm) {
		return s.actions.filter(action=>action.title.includes(s.filter.searchTerm as string))
	} else {
		return s.actions		
	}
});

// action

