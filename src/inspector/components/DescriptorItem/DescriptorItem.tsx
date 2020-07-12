import React from "react";
import "./DescriptorItem.less";
import { IDescriptor, TSelectDescriptorOperation } from "../../model/types";
import { IconLockLocked, IconPin } from "../../../shared/components/icons";

export interface IDescriptorItemProps {
	descriptor: IDescriptor
	autoSelected: boolean
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
		const {descriptor:{originalReference} } = this.props;
		const slug = originalReference._target.map(r => {
			if ("_ref" in r) {
				return r._ref;				
			}
			if ("_property" in r) {
				return r._property;				
			}
			return "n/a";
		});
		return <div>{slug.reverse().join(" / ")}</div>;

	}

	public render(): React.ReactNode{
		const { descriptor, autoSelected } = this.props;
		
		const {descriptor:{locked,pinned} } = this.props;
		return (
			<div className={"DescriptorItem" + (descriptor.selected ? " selected" : "") + (autoSelected?" autoSelected":"")} onClick={this.select}>
				<div className="name">{this.generateItemName()}</div>
				<div className="spread"></div>
				{locked ? <div className="icon"><IconLockLocked/></div> : ""}
				{pinned ? <div className="icon"><IconPin/></div>: ""}
				<div className="time">{descriptor.endTime-descriptor.startTime} ms</div>
			</div>
		);
	}
}