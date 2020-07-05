import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IDescriptorItemProps, IDescriptorItemDispatch } from "./DescriptorItem";
import cloneDeep from "lodash/cloneDeep";
import {DescriptorItem} from "./DescriptorItem";
import { IRootState } from "../../store";
import { IDescriptor, TSelectDescriptorOperation } from "../reducers/initialStateInspector";
import { selectDescriptorAction } from "../actions/inspectorActions";

interface IOwn{
	descriptor:IDescriptor
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IDescriptorItemProps => {
	
	return {
		descriptor: cloneDeep(ownProps.descriptor),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IDescriptorItemDispatch, IOwn> = (dispatch):IDescriptorItemDispatch => {
	return {
		onSelect:(uuid:string,operation:TSelectDescriptorOperation)=>dispatch(selectDescriptorAction(operation,uuid)),
	};
};

export const DescriptorItemContainer = connect<IDescriptorItemProps, IDescriptorItemDispatch, IOwn>(mapStateToProps, mapDispatchToProps)(DescriptorItem);