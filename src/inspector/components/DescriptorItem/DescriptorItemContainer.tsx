import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IDescriptorItemProps, IDescriptorItemDispatch } from "./DescriptorItem";
import cloneDeep from "lodash/cloneDeep";
import {DescriptorItem} from "./DescriptorItem";
import { IRootState } from "../../../shared/store";
import { selectDescriptorAction } from "../../actions/inspectorActions";
import { IDescriptor, TSelectDescriptorOperation } from "../../model/types";

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