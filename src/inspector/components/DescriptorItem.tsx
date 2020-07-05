import React from "react";
import { IDescriptor, TSelectDescriptorOperation } from "../reducers/initialStateInspector";

export interface IDescriptorItemProps{
	descriptor:IDescriptor
}

export interface IDescriptorItemDispatch {
	onSelect:(uuid:string,operation:TSelectDescriptorOperation)=>void
}

export interface IDescriptorItemState{
	
}


export type TDescriptorItem = IDescriptorItemProps & IDescriptorItemDispatch
export type TDescriptorItemComponent = React.Component<TDescriptorItem, IDescriptorItemState>

export class DescriptorItem extends React.Component<TDescriptorItem, IDescriptorItemState> { 
	constructor(props: TDescriptorItem) {
		super(props);
		
		this.state = {
		};
	}
	private select = () => {
		this.props.onSelect(this.props.descriptor.id, "replace");
	}

	public render():React.ReactNode{
		return (
			<div onClick={this.select}>{this.props.descriptor.id}</div>
		);
	}
}