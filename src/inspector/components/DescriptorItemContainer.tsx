import {connect} from "react-redux";
import cloneDeep from "lodash/cloneDeep";
import {IRootState} from "../../shared/store";
import {selectDescriptorAction, renameDescriptorAction, setRenameModeAction} from "../actions/inspectorActions";
import {IDescriptor, TSelectDescriptorOperation} from "../model/types";
import {getAutoSelectedUUIDs} from "../selectors/inspectorSelectors";
import React from "react";
import "./DescriptorItemContainer.less";
import {IconLockLocked, IconPinDown} from "../../shared/components/icons";
import {Dispatch} from "redux";
import {default as SP} from "react-uxp-spectrum";
import {getIcon} from "../helpers";


export const DescriptorItem: React.FC<TDescriptorItem> = (props) => {
	const [tempName, setTempName] = React.useState(props.descriptor.title);

	const select = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		let operation: TSelectDescriptorOperation = "replace";

		if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
			operation = "subtractContinuous";
		} else if (e.shiftKey) {
			operation = "addContinuous";
		} else if (e.ctrlKey || e.metaKey) {
			if (props.descriptor.selected) {
				operation = "subtract";
			} else {
				operation = "add";
			}
		}
		props.onSelect(props.descriptor.id, operation, props.descriptor.crc);
	};

	const autoSelected = props.autoSelected.includes(props.descriptor.id);

	const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTempName(e.currentTarget.value);
	};

	const hasError = (props.descriptor.recordedData as any)?.[0]?._obj === "error";

	const generateClassName = () => {
		const {descriptor} = props;

		const errorClass = hasError ? " error" : "";

		return "wrap" + (descriptor.selected ? " selected" : "") + (autoSelected ? " autoSelected" : "") + errorClass;
	};

	const rename = () => {
		const {descriptor} = props;
		props.onChangeName(descriptor.id, tempName);
		props.setRenameMode(descriptor.id, false);
	};
	const cancel = () => {
		const {descriptor} = props;
		props.setRenameMode(descriptor.id, false);
	};

	const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		switch (e.key) {
			case "Escape":
				cancel();
				break;
			case "Enter":
				rename();
				break;
		}
	};

	const Icon = (): JSX.Element => {
		const type = props.descriptor.originalReference.type;

		const icon = getIcon(hasError ? "error" : type);

		return (
			<div className="titleIcon">
				{icon}
			</div>
		);
	};

	const renderEditState = () => {
		const {descriptor} = props;
		return (
			<div className={"editMode " + generateClassName()} onClick={select}>
				<sp-textfield
					class="renameInput"
					onInput={onNameChange}
					value={descriptor.title}
					type="text"
					onKeyDown={onKeyPress}
					size={SP.SpectrumComponetDefaults.defaultSize}
				/>
				<div className="button" onClick={rename}>OK</div>
				<div className="button" onClick={cancel}>×</div>
			</div>
		);
	};

	const renderNormalState = () => {
		const {descriptor} = props;


		const {descriptor: {locked, pinned, groupCount}} = props;
		return (
			<div className={"normalMode " + generateClassName()} onClick={select}>
				<Icon />
				<div className="name">{descriptor.title}</div>
				<div className="spread"></div>
				{(groupCount && groupCount > 1) && <div>{groupCount}×</div>}
				{locked && <div className="icon"><IconLockLocked /></div>}
				{pinned && <div className="icon"><IconPinDown /></div>}
				{descriptor.startTime === 0 ? null : <div className="time">{descriptor.endTime - descriptor.startTime} ms</div>}
			</div>
		);
	};

	const {renameMode} = props.descriptor;
	if (renameMode) {
		return renderEditState();
	} else {
		return renderNormalState();
	}
};


type TDescriptorItem = IDescriptorItemProps & IDescriptorItemDispatch

interface IOwn {
	descriptor: IDescriptor
}

interface IState {
	tempName: string
}

interface IDescriptorItemProps {
	descriptor: IDescriptor
	autoSelected: string[]
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IDescriptorItemProps => ({
	descriptor: cloneDeep(ownProps.descriptor),
	autoSelected: getAutoSelectedUUIDs(state),
});

interface IDescriptorItemDispatch {
	onSelect: (uuid: string, operation: TSelectDescriptorOperation, crc?: number) => void
	onChangeName: (uuid: string, name: string) => void
	setRenameMode: (uuid: string, on: boolean) => void
}

const mapDispatchToProps = (dispatch: Dispatch): IDescriptorItemDispatch => ({
	onSelect: (uuid: string, operation: TSelectDescriptorOperation, crc?: number) => dispatch(selectDescriptorAction(operation, uuid, crc)),
	onChangeName: (uuid: string, name: string) => dispatch(renameDescriptorAction(uuid, name)),
	setRenameMode: (uuid: string, on: boolean) => dispatch(setRenameModeAction(uuid, on)),
});

export const DescriptorItemContainer = connect<IDescriptorItemProps, IDescriptorItemDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(DescriptorItem);