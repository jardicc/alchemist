import "./ItemVisibilityButton.less";
import {IRootState} from "../../../shared/store";
import {connect, MapDispatchToPropsNonObject} from "react-redux";
import {getCategoryItemsVisibility} from "../../selectors/inspectorSelectors";
import {setCategoryItemVisibilityAction} from "../../actions/inspectorActions";
import React, {MouseEventHandler} from "react";
import {TTargetReference} from "../../model/types";
import {IAccDropPostFixProps} from "../AccDrop/AccDrop";
import {IconEye} from "../../../shared/components/icons";



class ItemVisibilityButton extends React.Component<TItemVisibilityButton, Record<string, unknown>> {
	constructor(props: TItemVisibilityButton) {
		super(props);
	}

	private get visible(): boolean {
		return this.props.visibleItems.includes(this.props.value);
	}

	private toggle = () => {
		this.props.onChangeVisibility(this.props.value, this.visible ? "remove" : "add");
	};


	public render(): JSX.Element {
		return (
			<div
				className={"ItemVisibilityButton " + (this.visible ? "visible" : "hidden")}
				onClick={(e) => {e.stopPropagation(); this.toggle();}}
			>
				<IconEye />
			</div>
		);
	}
}


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
export class ItemVisibilityButtonWrap extends React.Component<IAccDropPostFixProps>{
	constructor(props: IAccDropPostFixProps) {
		super(props);
	}

	render(): React.ReactNode {
		return (
			<ItemVisibilityButtonContainer value={this.props.value as TTargetReference} />
		);
	}
}