import React from "react";
import "./DescriptorItem.less";
import { IDescriptor, TSelectDescriptorOperation, ITargetReference, TAllReferenceSubtypes } from "../../model/types";
import { IconLockLocked, IconPin } from "../../../shared/components/icons";
import { TState } from "../FilterButton/FilterButton";
import { getName } from "../../classes/GetName";

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

	private generateItemNameNew = (): string => {
		if (this.props.descriptor.originalReference.type==="listener") {
			return this.props.descriptor.calculatedReference._obj;
		}
		const parts = getName(this.props.descriptor.calculatedReference._target);
		//parts.push(...subs.map(d => d.subType + ": " + d.content.value));
		const names = parts.map(p => /*p.typeTitle +*/ ((p.value) ? (/*": "*/ p.value) : p.typeTitle));
		return names.join(" / ");
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

	private get autoSelected():boolean {
		return this.props.autoSelected.includes(this.props.descriptor.id);
	}

	public render(): React.ReactNode{
		const { descriptor } = this.props;
		
		const {descriptor:{locked,pinned} } = this.props;
		return (
			<div className={"wrap" + (descriptor.selected ? " selected" : "") + (this.autoSelected?" autoSelected":"")} onClick={this.select}>
				<div className="name">{this.generateItemNameNew()}</div>
				<div className="spread"></div>
				{locked ? <div className="icon"><IconLockLocked/></div> : ""}
				{pinned ? <div className="icon"><IconPin/></div>: ""}
				{descriptor.startTime===0 ? <div className="time">Event</div> : <div className="time">{descriptor.endTime-descriptor.startTime} ms</div>}
			</div>
		);
	}
}