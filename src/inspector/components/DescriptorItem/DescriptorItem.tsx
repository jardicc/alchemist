import React from "react";
import "./DescriptorItem.less";
import { IDescriptor, TSelectDescriptorOperation, ITargetReference, TAllReferenceSubtypes } from "../../model/types";
import { IconLockLocked, IconPin } from "../../../shared/components/icons";
import { TState } from "../FilterButton/FilterButton";

export interface IDescriptorItemProps {
	descriptor: IDescriptor
	autoSelected: boolean
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
		if (this.props.activeTargetReference === null) { return "null - Error";}
		// eslint-disable-next-line prefer-const
		let { descriptor: { originalReference }, activeTargetReference,filterBySelectedReferenceType } = this.props;

		const titles: string[] = [originalReference.type];
		let subs:TAllReferenceSubtypes[] = [];
		
		if (originalReference.type === activeTargetReference.type && filterBySelectedReferenceType !== "off") {
			titles.unshift();

			subs = originalReference.data.filter((d,index) => {
				const last = index === activeTargetReference.data.length - 1;
				if (last) {
					return true;
				}
				const found = activeTargetReference.data.find((a) => a.subType === d.subType);

				if (!found) {
					return true;
				}

				return (/*(found.content.value === d.content.value) &&*/ (found.content.filterBy === "off"));
			});

		} else {
			subs = originalReference.data;
		}
			
		titles.push(...subs.map(d => d.subType + ": " + d.content.value));
		return titles.join(" / ");		
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