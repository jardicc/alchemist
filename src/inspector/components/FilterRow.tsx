import React, {ComponentType} from "react";
import {AccDrop, IAccDropPostFixProps} from "./AccDrop";
import {FilterButton, TFilterState} from "./FilterButton";
import {TSubTypes, IPropertyItem, IPropertyGroup, TTargetReference, TAllTargetReferences} from "../model/types";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {getActiveRef} from "../selectors/inspectorSelectors";
import {inspectorSlice} from "../inspectorSlice";

const {setFilterState} = inspectorSlice.actions;

export const FilterRow: React.FC<IFilterRowProps> = (props) => {
	const activeRef = useAppSelector(getActiveRef);
	const dispatch = useAppDispatch();
	const onSetFilter = (type: TTargetReference, subType: TSubTypes | "main", state: TFilterState) => dispatch(setFilterState(type, subType, state));

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
			"group" in item ? item.data.map((d: IPropertyItem) => d.value) : [(item).value],
		);
		const currentValues = Array.isArray(content) ? content : [content];
		const hasUnresolved = currentValues.some(v => !flatValues.includes(v));
		if (hasUnresolved) {
			onUpdateList().then(newList => { setList(newList ?? []); });
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
			onSelect={(id, value, toggleProperty) => { onSelect(value, !!toggleProperty); }}
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
						onSetFilter(activeRef.type, subtype, state);
						e.stopPropagation();
					}}
				/>
			}
		/>
	);
};

interface IFilterRowProps {
	subtype: TSubTypes | "main"
	header: string | React.ReactElement
	initialItems?: (IPropertyItem | IPropertyGroup)[]
	items?: (IPropertyItem | IPropertyGroup)[]
	icons?: boolean
	filterBy: TFilterState
	value: string | number | string[]
	showSearch?: boolean
	ItemPostFix?: ComponentType<IAccDropPostFixProps>
	doNotCollapse?: boolean
	supportMultiSelect?: boolean
	onSelect: (value: string | number, toggle: boolean) => void
	onUpdateList?: () => Promise<(IPropertyItem | IPropertyGroup)[]>
}