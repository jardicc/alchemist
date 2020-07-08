import React from "react";
import "./DescriptorItem.css";
import { IDescriptor, TSelectDescriptorOperation } from "../../model/types";

export interface IDescriptorItemProps{
	descriptor:IDescriptor
}

export interface IDescriptorItemDispatch {
	onSelect:(uuid:string,operation:TSelectDescriptorOperation)=>void
}


export type TDescriptorItem = IDescriptorItemProps & IDescriptorItemDispatch
export type TDescriptorItemComponent = React.Component<TDescriptorItem>

export class DescriptorItem extends React.Component<TDescriptorItem> { 
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

	private generateItemName = () => {
		const {descriptor:{originalReference,locked,pinned} } = this.props;
		const slug = originalReference._target.map(r => {
			if ("_ref" in r) {
				return r._ref;				
			}
			if ("_property" in r) {
				return r._property;				
			}
			return "n/a";
		});
		const lockedStr = locked ? " [L] " : "";
		const pinnedStr = pinned ? " [P] " : "";
		return slug.reverse().join(" / ") + lockedStr + pinnedStr;

	}

	public render():React.ReactNode{
		return (
			<div className={"DescriptorItem" + (this.props.descriptor.selected ? " selected" : "")} onClick={this.select}>
				<span className="name">{this.generateItemName()}</span>
				<span className="time">{this.props.descriptor.endTime-this.props.descriptor.startTime} ms</span>
			</div>
		);
	}
}