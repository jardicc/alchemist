import {useAppDispatch, useAppSelector, rootStore} from "../../shared/store";

import React from "react";

import "./ATNDecoder.less";

import {decodeATN} from "../classes/ATNDecoder";
import {Footer} from "../../inspector/components/Footer";
import {IDescriptor, TSelectDescriptorOperation} from "../../inspector/model/types";
import {getAllDescriptors, getFontSizeSettings, getInspectorSettings} from "../../inspector/selectors/inspectorSelectors";
import {getActionByUUID, getData, getDontSendDisabled, getTextData, selectedCommands as getSelectedCommands} from "../atnSelectors";
import {IActionSetUUID, TSelectActionOperation, TSelectedItem} from "../atnModel";
import {ActionSet} from "./ActionSet";
import {inspectorSlice} from "../../inspector/inspectorSlice";
import {alert} from "../../inspector/classes/Helpers";
import {str as crc} from "crc-32";
import PS from "photoshop";
import SP from "react-uxp-spectrum";
import {atnSlice} from "../atnSlice";

const {addDescriptor, selectDescriptor, setInspectorView, setModeTab, toggleDescriptorsGrouping} = inspectorSlice.actions;
const {clearAll, setData, setDontSendDisabled, selectAction} = atnSlice.actions;

export const ATNDecoder: React.FC = () => {
	const dispatch = useAppDispatch();
	const fontSizeSettings = useAppSelector(getFontSizeSettings);
	const data = useAppSelector(getData);
	const textData = useAppSelector(getTextData);
	const selectedCommands = useAppSelector(getSelectedCommands);
	const dontSendDisabled = useAppSelector(getDontSendDisabled);
	const allAlchemistDescriptors = useAppSelector(getAllDescriptors);
	const settingsAlchemist = useAppSelector(getInspectorSettings);

	const onSetData = (d: IActionSetUUID[]) => dispatch(setData(d));
	const onClearAll = () => dispatch(clearAll());
	const onPassSelected = (desc: IDescriptor, replace: boolean) => {
		dispatch(setModeTab("reference"));
		dispatch(setInspectorView("code", "generated"));
		dispatch(toggleDescriptorsGrouping("none"));
		dispatch(addDescriptor(desc, replace));
	};
	const onSelectAlchemistDescriptors = (operation: TSelectDescriptorOperation, uuid?: string) => dispatch(selectDescriptor(operation, uuid));
	const onSetSelectedItem = (uuid: TSelectedItem, operation: TSelectActionOperation) => dispatch(selectAction(operation, uuid));
	const onSetDontSendDisabled = (value: boolean) => dispatch(setDontSendDisabled(value));
	const renderAddButton = () => (
		<div className="button" onClick={async (e) => {
			e.stopPropagation();
			const res = await decodeATN();
			onSetData(res);
		}}>
			Read .ATN file
		</div>
	);

	const renderSet = () => {
		if (!data.length) {
			return (
				<div className="ctaEmpty">
					<span>Please open some Photoshop Action files (.atn)</span>
					{renderAddButton()}
				</div>
			);
		}

		return (
			data.map((set, i) => (
				<ActionSet actionSet={set} key={i} />
			))
		);
	};

	const pass = (replace = false) => {

		let cmds = selectedCommands;

		onSelectAlchemistDescriptors("none");

		if (dontSendDisabled) {
			cmds = cmds.filter(c => c.enabled);
		}

		if (cmds.length > settingsAlchemist.maximumItems) {
			alert(`Alchemist can currently show only ${settingsAlchemist.maximumItems} items. Increase limit in Alchemist settings if you want to see ${cmds.length - settingsAlchemist.maximumItems} additional items`);
		}

		cmds.forEach((command, index) => {

			const commandParrent = getActionByUUID(rootStore.getState().inspector, command.__uuidParentSet__, command.__uuidParentAction__);
			const descCrc = crc(JSON.stringify(command.descriptor));

			const desc: IDescriptor = {
				playAbleData: command.descriptor as any,
				crc: descCrc,
				descriptorSettings: {
					dialogOptions: command.showDialogs ? "display" : "dontDisplay",
					modalBehavior: "wait",
					supportRawDataType: true,
					synchronousExecution: false,
				},
				endTime: 0,
				id: crypto.randomUUID(),
				locked: false,
				recordedData: command.descriptor,
				originalReference: {
					type: "listener",
				},
				pinned: false,
				renameMode: false,
				selected: true,
				startTime: 0,
				title: PS.core.translateUIString(commandParrent?.actionItemName ?? "") + " / " + command.commandName,
			};

			const cleanOld = index === 0 && replace;
			onPassSelected(desc, cleanOld);
		});

	};

	return (
		<div className={`ATNDecoderContainer ${fontSizeSettings}`} key={fontSizeSettings}>
			<div className="info spread flex">
				<div className="tree" onClick={(e) => {e.stopPropagation(); onSetSelectedItem([""], "none");}}>{renderSet()}</div>
				<div className="atnCode">
					<SP.Textarea
						className="infoBlock"
						value={textData}
					/>
				</div>
			</div>
			<div className="buttonBar">
				{renderAddButton()}
				<div className={"button " + (!selectedCommands.length ? "disallowed" : "")} onClick={() => { pass(); }}>Add to Alchemist</div>
				<div className={"button " + (!selectedCommands.length ? "disallowed" : "")} onClick={() => { pass(true); }}>Replace in Alchemist</div>
				<SP.Checkbox onChange={() => onSetDontSendDisabled(!dontSendDisabled)} checked={dontSendDisabled}>{"Don't send disabled"}</SP.Checkbox>
				<div className="spread"></div>
				<div className={"button " + (!data.length ? "disallowed" : "")} onClick={onClearAll}>Clear all</div>
			</div>

			<Footer parentPanel="atnConverter" />
		</div>
	);
};
