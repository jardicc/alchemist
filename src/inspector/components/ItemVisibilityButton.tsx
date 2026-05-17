import "./ItemVisibilityButton.less";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {getCategoryItemsVisibility} from "../selectors/inspectorSelectors";
import {setCategoryItemVisibilityAction} from "../actions/inspectorActions";
import React, {MouseEventHandler} from "react";
import {TTargetReference} from "../model/types";
import {IAccDropPostFixProps} from "./AccDrop";
import {IconEye} from "../../shared/components/icons";

export const ItemVisibilityButtonWrap: React.FC<IAccDropPostFixProps> = (props) => {
	const value = props.value as TTargetReference;

	const dispatch = useAppDispatch();
	const visibleItems = useAppSelector(getCategoryItemsVisibility);

	const visible = visibleItems.includes(value);

	const toggle = () => {
		dispatch(setCategoryItemVisibilityAction(value, visible ? "remove" : "add"));
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