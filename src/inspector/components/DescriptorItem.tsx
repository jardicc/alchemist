import {useAppDispatch, useAppSelector} from "../../shared/store";
import cloneDeep from "lodash/cloneDeep";
import {inspectorSlice} from "../inspectorSlice";
import {IDescriptor, TSelectDescriptorOperation} from "../model/types";
import {getAutoSelectedUUIDs} from "../selectors/inspectorSelectors";
import React from "react";
import "./DescriptorItem.less";
import {IconLockLocked, IconPinDown} from "../../shared/components/icons";
import {default as SP} from "react-uxp-spectrum";
import {getIcon} from "../helpers";

interface IDescriptorItemProps {
	descriptor: IDescriptor
}

const {selectDescriptor, renameDescriptor, setRenameMode} = inspectorSlice.actions;

export const DescriptorItem: React.FC<IDescriptorItemProps> = ({descriptor: descriptorProp}) => {
	const descriptor = cloneDeep(descriptorProp);
	const dispatch = useAppDispatch();
	const autoSelectedUUIDs = useAppSelector(getAutoSelectedUUIDs);
	const onSelect = (uuid: string, operation: TSelectDescriptorOperation, crcVal?: number) => dispatch(selectDescriptor(operation, uuid, crcVal));
	const onChangeName = (uuid: string, name: string) => dispatch(renameDescriptor(uuid, name));
	const onSetRenameMode = (uuid: string, on: boolean) => dispatch(setRenameMode(uuid, on));

	const [tempName, setTempName] = React.useState(descriptor.title);

	const select = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		let operation: TSelectDescriptorOperation = "replace";

		if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
			operation = "subtractContinuous";
		} else if (e.shiftKey) {
			operation = "addContinuous";
		} else if (e.ctrlKey || e.metaKey) {
			if (descriptor.selected) {
				operation = "subtract";
			} else {
				operation = "add";
			}
		}
		onSelect(descriptor.id, operation, descriptor.crc);
	};

	const autoSelected = autoSelectedUUIDs.includes(descriptor.id);

	const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTempName(e.currentTarget.value);
	};

	const hasError = (descriptor.recordedData as any)?.[0]?._obj === "error";

	const generateClassName = () => {
		const errorClass = hasError ? " error" : "";
		return "wrap" + (descriptor.selected ? " selected" : "") + (autoSelected ? " autoSelected" : "") + errorClass;
	};

	const rename = () => {
		onChangeName(descriptor.id, tempName);
		onSetRenameMode(descriptor.id, false);
	};
	const cancel = () => {
		onSetRenameMode(descriptor.id, false);
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
		const type = descriptor.originalReference.type;

		const icon = getIcon(hasError ? "error" : type);

		return (
			<div className="titleIcon">
				{icon}
			</div>
		);
	};

	const renderEditState = () => {
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
		const {locked, pinned, groupCount} = descriptor;
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

	const {renameMode} = descriptor;
	if (renameMode) {
		return renderEditState();
	} else {
		return renderNormalState();
	}
};
