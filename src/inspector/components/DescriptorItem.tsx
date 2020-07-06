import React from "react";
import { IDescriptor, TSelectDescriptorOperation } from "../reducers/initialStateInspector";
import "./DescriptorItem.css";

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
	private select = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		let operation: TSelectDescriptorOperation = "replace";
		
		if (e.ctrlKey || e.metaKey) {
			if (this.props.descriptor.selected) {
				operation = "subtract";				
			} else {
				operation = "add";				
			}
		}
		this.props.onSelect(this.props.descriptor.id, operation);
	}

	public render():React.ReactNode{
		return (
			<div className={"DescriptorItem" + (this.props.descriptor.selected ? " selected" : "")} onClick={this.select}>
				<span>{this.props.descriptor.id}</span>
				<span className="time">{this.props.descriptor.endTime-this.props.descriptor.startTime}ms</span>
			</div>
		);
	}
}