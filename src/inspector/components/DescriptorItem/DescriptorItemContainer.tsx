import { connect, MapDispatchToPropsFunction } from "react-redux";
import cloneDeep from "lodash/cloneDeep";
import { IRootState } from "../../../shared/store";
import { selectDescriptorAction, renameDescriptorAction, setRenameModeAction } from "../../actions/inspectorActions";
import { IDescriptor, ITargetReference, TSelectDescriptorOperation } from "../../model/types";
import { getActiveTargetReference, getFilterBySelectedReferenceType, getAutoSelectedUUIDs } from "../../selectors/inspectorSelectors";
import React from "react";
import "./DescriptorItem.less";
import { IconLockLocked, IconPinDown } from "../../../shared/components/icons";
import { TState } from "../FilterButton/FilterButton";
interface IOwn{
	descriptor: IDescriptor
}

export interface IDescriptorItemProps {
	descriptor: IDescriptor
	autoSelected: string[]
	activeTargetReference: ITargetReference | null;
	filterBySelectedReferenceType:TState
}

export interface IDescriptorItemDispatch {
	onSelect: (uuid: string, operation: TSelectDescriptorOperation) => void
	onChangeName: (uuid: string, name: string) => void
	setRenameMode: (uuid: string, on: boolean) => void
}

interface IState{
	tempName:string
}


export type TDescriptorItem = IDescriptorItemProps & IDescriptorItemDispatch
export type TDescriptorItemComponent = React.Component<TDescriptorItem>

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
		this.props.onSelect(this.props.descriptor.id, operation);
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
				<input
					className="renameInput"
					onChange={this.onNameChange}
					defaultValue={descriptor.title}
					type="text"
					onKeyDown={this.onKeyPress}
				/>
				<div className="button" onClick={this.rename}>OK</div>
				<div className="button" onClick={this.cancel}>×</div>
			</div>
		);
	}

	private renderNormalState = () => {
		const { descriptor } = this.props;
		
		const {descriptor:{locked,pinned} } = this.props;
		return (
			<div className={"normalMode " + this.generateClassName()} onClick={this.select}>
				<div className="name">{descriptor.title}</div>
				<div className="spread"></div>
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

const mapStateToProps = (state: IRootState, ownProps: IOwn): IDescriptorItemProps => {
	
	return {
		descriptor: cloneDeep(ownProps.descriptor),
		autoSelected: getAutoSelectedUUIDs(state),
		activeTargetReference: getActiveTargetReference(state),
		filterBySelectedReferenceType:getFilterBySelectedReferenceType(state),
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IDescriptorItemDispatch, IOwn> = (dispatch):IDescriptorItemDispatch => {
	return {
		onSelect: (uuid: string, operation: TSelectDescriptorOperation) => dispatch(selectDescriptorAction(operation, uuid)),
		onChangeName: (uuid: string, name: string) => dispatch(renameDescriptorAction(uuid,name)),
		setRenameMode: (uuid: string, on: boolean) => dispatch(setRenameModeAction(uuid,on)),
	};
};

export const DescriptorItemContainer = connect<IDescriptorItemProps, IDescriptorItemDispatch, IOwn>(mapStateToProps, mapDispatchToProps)(DescriptorItem);