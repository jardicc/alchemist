import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IDescriptorItemProps, IDescriptorItemDispatch } from "./DescriptorItem";
import cloneDeep from "lodash/cloneDeep";
import {DescriptorItem} from "./DescriptorItem";
import { IRootState } from "../../../shared/store";
import { selectDescriptorAction } from "../../actions/inspectorActions";
import { IDescriptor, TSelectDescriptorOperation } from "../../model/types";
import { getActiveTargetReference, getFilterBySelectedReferenceType, getAutoSelectedIDs } from "../../selectors/inspectorSelectors";

interface IOwn{
	descriptor: IDescriptor
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IDescriptorItemProps => {
	
	return {
		descriptor: cloneDeep(ownProps.descriptor),
		autoSelected: getAutoSelectedIDs(state),
		activeTargetReference: getActiveTargetReference(state),
		filterBySelectedReferenceType:getFilterBySelectedReferenceType(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IDescriptorItemDispatch, IOwn> = (dispatch):IDescriptorItemDispatch => {
	return {
		onSelect:(uuid:string,operation:TSelectDescriptorOperation)=>dispatch(selectDescriptorAction(operation,uuid)),
	};
};

export const DescriptorItemContainer = connect<IDescriptorItemProps, IDescriptorItemDispatch, IOwn>(mapStateToProps, mapDispatchToProps)(DescriptorItem);