import "./ItemVisibilityButton.less";
import {IRootState} from "../../shared/store";
import {connect, MapDispatchToPropsNonObject} from "react-redux";
import {getCategoryItemsVisibility} from "../selectors/inspectorSelectors";
import {setCategoryItemVisibilityAction} from "../actions/inspectorActions";
import React, {MouseEventHandler} from "react";
import {TTargetReference} from "../model/types";
import {IAccDropPostFixProps} from "./AccDrop";
import {IconEye} from "../../shared/components/icons";



const ItemVisibilityButton: React.FC<TItemVisibilityButton> = (props) => {
	const visible = props.visibleItems.includes(props.value);

	const toggle = () => {
		props.onChangeVisibility(props.value, visible ? "remove" : "add");
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


type TItemVisibilityButton = IItemVisibilityButtonProps & IItemVisibilityButtonDispatch

interface IItemVisibilityButtonProps extends IOwnProps {
	visibleItems: TTargetReference[]
}

interface IOwnProps {
	value: TTargetReference
}

const mapStateToProps = (state: IRootState, ownProps: IOwnProps): IItemVisibilityButtonProps => ({
	visibleItems: getCategoryItemsVisibility(state),
	value: ownProps.value,
});

interface IItemVisibilityButtonDispatch {
	onChangeVisibility: (item: TTargetReference, operation: "add" | "remove") => void
}

const mapDispatchToProps: MapDispatchToPropsNonObject<IItemVisibilityButtonDispatch, IOwnProps> = (dispatch): IItemVisibilityButtonDispatch => ({
	onChangeVisibility: (item, operation) => dispatch(setCategoryItemVisibilityAction(item, operation)),
});

const ItemVisibilityButtonContainer = connect(mapStateToProps, mapDispatchToProps)(ItemVisibilityButton);


// I don't know how to pass container as a prop and do typings correctly but I can do that with simple component }:-)
export const ItemVisibilityButtonWrap: React.FC<IAccDropPostFixProps> = (props) => {
	return (
		<ItemVisibilityButtonContainer value={props.value as TTargetReference} />
	);
};