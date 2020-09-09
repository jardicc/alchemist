import React from "react";
import "./DescriptorItem.less";
import { IDescriptor, TSelectDescriptorOperation, ITargetReference } from "../../model/types";
import { IconLockLocked, IconPin } from "../../../shared/components/icons";
import { TState } from "../FilterButton/FilterButton";

export interface IDescriptorItemProps {
	descriptor: IDescriptor
	autoSelected: string[]
	activeTargetReference: ITargetReference | null;
	filterBySelectedReferenceType:TState
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
		
		if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
			operation = "subtractContinuous";
		} else if (e.shiftKey) {
			operation = "addContinuous";
		} else if (e.ctrlKey || e.metaKey) {
			if (this.props.descriptor.selected) {
				operation = "subtract";				
			} else {
				operation = "add";				
			}
		} 
		this.props.onSelect(this.props.descriptor.id, operation);
	}

	private get autoSelected():boolean {
		return this.props.autoSelected.includes(this.props.descriptor.id);
	}

	public render(): React.ReactNode{
		const { descriptor } = this.props;
		
		const {descriptor:{locked,pinned} } = this.props;
		return (
			<div className={"wrap" + (descriptor.selected ? " selected" : "") + (this.autoSelected?" autoSelected":"")} onClick={this.select}>
				<div className="name">{descriptor.title}</div>
				<div className="spread"></div>
				{locked ? <div className="icon"><IconLockLocked/></div> : ""}
				{pinned ? <div className="icon"><IconPin/></div>: ""}
				{descriptor.startTime===0 ? <div className="time">Event</div> : <div className="time">{descriptor.endTime-descriptor.startTime} ms</div>}
			</div>
		);
	}
}