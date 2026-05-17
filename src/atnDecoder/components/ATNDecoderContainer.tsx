import {useAppDispatch, useAppSelector, rootStore} from "../../shared/store";

import React from "react";

import "./ATNDecoderContainer.less";

import {decodeATN} from "../classes/ATNDecoder";
import {Footer} from "../../inspector/components/FooterContainer";
import {IDescriptor, ISettings, TFontSizeSettings, TSelectDescriptorOperation} from "../../inspector/model/types";
import {getAllDescriptors, getFontSizeSettings, getInspectorSettings} from "../../inspector/selectors/inspectorSelectors";
import {getActionByUUID, getData, getDontSendDisabled, getTextData, selectedCommands as getSelectedCommands} from "../atnSelectors";
import {clearAllAction, passSelectedAction, setDataAction, setDontSendDisabledAction, setSelectActionAction} from "../atnActions";
import {IActionCommandUUID, IActionSetUUID, TSelectActionOperation, TSelectedItem} from "../atnModel";
import {ActionSet} from "./ActionSetContainer";
import {addDescriptorAction, selectDescriptorAction, setInspectorViewAction, setModeTabAction, toggleDescriptorsGroupingAction} from "../../inspector/actions/inspectorActions";
import {alert, Helpers} from "../../inspector/classes/Helpers";
import {str as crc} from "crc-32";
import PS from "photoshop";
import SP from "react-uxp-spectrum";
import {ActionDescriptor} from "photoshop/dom/CoreModules";

export const ATNDecoder: React.FC = () => {
	const dispatch = useAppDispatch();
	const fontSizeSettings = useAppSelector(getFontSizeSettings);
	const data = useAppSelector(getData);
	const textData = useAppSelector(getTextData);
	const selectedCommands = useAppSelector(getSelectedCommands);
	const dontSendDisabled = useAppSelector(getDontSendDisabled);
	const allAlchemistDescriptors = useAppSelector(getAllDescriptors);
	const settingsAlchemist = useAppSelector(getInspectorSettings);

	const setData = (d: IActionSetUUID[]) => dispatch(setDataAction(d));
	const onClearAll = () => dispatch(clearAllAction());
	const onPassSelected = (desc: IDescriptor, replace: boolean) => {
		dispatch(setModeTabAction("reference"));
		dispatch(setInspectorViewAction("code", "generated"));
		dispatch(toggleDescriptorsGroupingAction("none"));
		dispatch(addDescriptorAction(desc, replace));
	};
	const onSelectAlchemistDescriptors = (operation: TSelectDescriptorOperation, uuid?: string) => dispatch(selectDescriptorAction(operation, uuid));
	const setSelectedItem = (uuid: TSelectedItem, operation: TSelectActionOperation) => dispatch(setSelectActionAction(operation, uuid));
	const onSetDontSendDisabled = (value: boolean) => dispatch(setDontSendDisabledAction(value));
	const renderAddButton = () => (
		<div className="button" onClick={async (e) => {
			e.stopPropagation();
			const res = await decodeATN();
			setData(res);
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
				<div className="tree" onClick={(e) => {e.stopPropagation(); setSelectedItem([""], "none");}}>{renderSet()}</div>
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
