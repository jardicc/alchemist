import "./ItemVisibilityButton.less";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {getCategoryItemsVisibility} from "../selectors/inspectorSelectors";
import {inspectorSlice} from "../inspectorSlice";
import React from "react";
import {TTargetReference} from "../model/types";
import {IAccDropPostFixProps} from "./AccDrop";
import {IconEye} from "../../shared/components/icons";

const {setCategoryItemVisibility} = inspectorSlice.actions;

export const ItemVisibilityButtonWrap: React.FC<IAccDropPostFixProps> = (props) => {
	const value = props.value as TTargetReference;

	const dispatch = useAppDispatch();
	const visibleItems = useAppSelector(getCategoryItemsVisibility);

	const visible = visibleItems.includes(value);

	const toggle = () => {
		dispatch(setCategoryItemVisibility(value, visible ? "remove" : "add"));
	};

	return (
		<div
			className={"ItemVisibilityButton " + (visible ? "visible" : "hidden")}
			onClick={(e) => {e.stopPropagation(); toggle();}}
		>
			<IconEye />
		</div>
	);
};