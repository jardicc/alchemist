import { connect} from "react-redux";
import cloneDeep from "lodash/cloneDeep";
import { IRootState } from "../../../shared/store";
import { selectDescriptorAction, renameDescriptorAction, setRenameModeAction } from "../../actions/inspectorActions";
import { IDescriptor, ITargetReference, TSelectDescriptorOperation } from "../../model/types";
import { getActiveTargetReference, getFilterBySelectedReferenceType, getAutoSelectedUUIDs } from "../../selectors/inspectorSelectors";
import React from "react";
import "./DescriptorItem.less";
import { IconLockLocked, IconPinDown } from "../../../shared/components/icons";
import { TState } from "../FilterButton/FilterButton";
import { Dispatch } from "redux";
import {default as SP} from "react-uxp-spectrum";

class DescriptorItem extends React.Component<TDescriptorItem,IState> { 
	constructor(props: TDescriptorItem) {
		super(props);
		
		this.state = {
			tempName:this.props.descriptor.title,
		};
	}
	private select = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
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
		this.props.onSelect(this.props.descriptor.id, operation, this.props.descriptor.crc);
	}

	private get autoSelected():boolean {
		return this.props.autoSelected.includes(this.props.descriptor.id);
	}

	private onNameChange=(e: React.ChangeEvent<HTMLInputElement>)=> {
		this.setState({
			tempName: e.currentTarget.value,
		});
	}

	private generateClassName = () => {
		const { descriptor } = this.props;
		return "wrap" + (descriptor.selected ? " selected" : "") + (this.autoSelected ? " autoSelected" : "");
	}

	private rename = () => {
		const { descriptor } = this.props;
		this.props.onChangeName(descriptor.id, this.state.tempName);
		this.props.setRenameMode(descriptor.id, false);
	}
	private cancel = () => {
		const { descriptor } = this.props;
		this.props.setRenameMode(descriptor.id, false);		
	}

	private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		switch (e.key) {
			case "Escape":
				this.cancel();
				break;
			case "Enter":
				this.rename();
				break;
		}
	}

	private renderEditState = () => {
		const { descriptor } = this.props;
		return (
			<div className={"editMode " + this.generateClassName()} onClick={this.select}>
				<sp-textfield
					className="renameInput"
					onInput={this.onNameChange}
					defaultValue={descriptor.title}
					type="text"
					onKeyDown={this.onKeyPress}
					size={SP.SpectrumComponetDefaults.defaultSize}
				/>
				<div className="button" onClick={this.rename}>OK</div>
				<div className="button" onClick={this.cancel}>×</div>
			</div>
		);
	}

	private renderNormalState = () => {
		const { descriptor } = this.props;
		
		const {descriptor:{locked,pinned,groupCount} } = this.props;
		return (
			<div className={"normalMode " + this.generateClassName()} onClick={this.select}>
				<div className="name">{descriptor.title}</div>
				<div className="spread"></div>
				{(groupCount && groupCount > 1) && <div>{groupCount}×</div>}
				{locked && <div className="icon"><IconLockLocked/></div> }
				{pinned && <div className="icon"><IconPinDown/></div>}
				{descriptor.startTime===0 ? <div className="time">Event</div> : <div className="time">{descriptor.endTime-descriptor.startTime} ms</div>}
			</div>
		);
	}

	public render(): React.ReactNode{
		const { renameMode} = this.props.descriptor;
		if (renameMode) {
			return this.renderEditState();
		} else {
			return this.renderNormalState();
		}
	}
}


type TDescriptorItem = IDescriptorItemProps & IDescriptorItemDispatch

interface IOwn{
	descriptor: IDescriptor
}

interface IState{
	tempName:string
}

interface IDescriptorItemProps {
	descriptor: IDescriptor
	autoSelected: string[]
	activeTargetReference: ITargetReference | null;
	filterBySelectedReferenceType:TState
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IDescriptorItemProps => ({
	descriptor: cloneDeep(ownProps.descriptor),
	autoSelected: getAutoSelectedUUIDs(state),
	activeTargetReference: getActiveTargetReference(state),
	filterBySelectedReferenceType: getFilterBySelectedReferenceType(state),
});

interface IDescriptorItemDispatch {
	onSelect: (uuid: string, operation: TSelectDescriptorOperation, crc?:number) => void
	onChangeName: (uuid: string, name: string) => void
	setRenameMode: (uuid: string, on: boolean) => void
}

const mapDispatchToProps = (dispatch:Dispatch):IDescriptorItemDispatch => ({
	onSelect: (uuid: string, operation: TSelectDescriptorOperation,crc?:number) => dispatch(selectDescriptorAction(operation, uuid,crc)),
	onChangeName: (uuid: string, name: string) => dispatch(renameDescriptorAction(uuid,name)),
	setRenameMode: (uuid: string, on: boolean) => dispatch(setRenameModeAction(uuid,on)),
});

export const DescriptorItemContainer = connect<IDescriptorItemProps, IDescriptorItemDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(DescriptorItem);