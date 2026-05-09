import React, {ComponentType} from "react";
import {AccDrop, IAccDropPostFixProps} from "./AccDrop";
import {FilterButton, TFilterState} from "./FilterButton";
import {TSubTypes, IPropertyItem, IPropertyGroup, TTargetReference, TAllTargetReferences} from "../model/types";
import {connect} from "react-redux";
import {IRootState} from "../../shared/store";
import {Dispatch} from "redux";
import {getActiveRef} from "../selectors/inspectorSelectors";
import {setFilterStateAction} from "../actions/inspectorActions";


export const FilterRow: React.FC<TFilterRow> = (props) => {
	const {value: content, subtype, filterBy, onSelect, onUpdateList, initialItems, items} = props;
	const [list, setListState] = React.useState<(IPropertyItem | IPropertyGroup)[]>(initialItems ?? []);

	const setList = (newList: (IPropertyItem | IPropertyGroup)[]) => {
		setListState([...(initialItems || []), ...newList]);
	};

	// Auto-fetch list on mount when the selected value isn't among the static initialItems.
	// This happens when FilterRow remounts (e.g. because it is defined as an inline sub-component)
	// and the user had previously selected a numeric document/layer ID.
	React.useEffect(() => {
		if (!onUpdateList) {return;}
		const flatValues = (initialItems ?? []).flatMap(item =>
			"group" in item ? item.data.map((d: IPropertyItem) => d.value) : [(item as IPropertyItem).value],
		);
		const currentValues = Array.isArray(content) ? content : [content];
		const hasUnresolved = currentValues.some(v => !flatValues.includes(v));
		if (hasUnresolved) {
			onUpdateList().then(newList => setList(newList ?? []));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	let newContent: (string | number)[];
	if (!Array.isArray(content)) {
		newContent = [content];
	} else {
		newContent = content;
	}

	return (
		<AccDrop
			{...props}
			id={subtype}
			selected={newContent}
			onSelect={(id, value, toggleProperty) => onSelect(value, !!toggleProperty)}
			onHeaderClick={async () => {
				if (!onUpdateList) {
					// setList(initialItems ?? []);
					return;
				}
				const newList = await onUpdateList() || [];
				setList(newList);
			}}
			items={items || list}
			headerPostFix={
				<FilterButton
					subtype={subtype}
					state={filterBy}
					onClick={(subtype, state, e) => {
						props.onSetFilter(props.activeRef.type, subtype, state);
						e.stopPropagation();
					}}
				/>
			}
		/>
	);
};
interface IFilterRowState {
	list: (IPropertyItem | IPropertyGroup)[]
}

interface IOwn {
	subtype: TSubTypes | "main"
	initialItems?: (IPropertyItem | IPropertyGroup)[]
	items?: (IPropertyItem | IPropertyGroup)[]
	icons?: boolean
	header: string | React.ReactElement
	filterBy: TFilterState
	value: string | number | string[]
	showSearch?: boolean
	ItemPostFix?: ComponentType<IAccDropPostFixProps>
	doNotCollapse?: boolean
	supportMultiSelect?: boolean
	onSelect: (value: string | number, toggle: boolean) => void
	onUpdateList?: () => Promise<(IPropertyItem | IPropertyGroup)[]>
}

export type TFilterRow = IFilterRowProps & IFilterRowDispatch

export interface IFilterRowProps extends IOwn {
	activeRef: TAllTargetReferences;
}

export type TFilterRowProps = IFilterRowProps & IOwn;

const mapStateToProps = (state: IRootState, ownProps: IOwn): IFilterRowProps => ({
	activeRef: getActiveRef(state),
	...ownProps,
});

interface IFilterRowDispatch {
	onSetFilter: (type: TTargetReference, subType: TSubTypes | "main", state: TFilterState) => void
}

const mapDispatchToProps = (dispatch: Dispatch): IFilterRowDispatch => ({
	onSetFilter: (type, subType, state) => dispatch(setFilterStateAction(type, subType, state)),
});

export const FilterRowContainer = connect<IFilterRowProps, IFilterRowDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(FilterRow);