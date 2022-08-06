import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState, rootStore } from "../../../shared/store";

import React from "react";

import "./../../../shared/ThemeVars.css";
import "./../../../shared/styles.less";
import "./ATNDecoderContainer.less";

import { decodeATN } from "../../../atnDecoder/classes/ATNDecoder";
import { FooterContainer } from "../../../inspector/components/Footer/FooterContainer";
import { IDescriptor, ISettings, TFontSizeSettings, TSelectDescriptorOperation } from "../../../inspector/model/types";
import { getAllDescriptors, getFontSizeSettings, getInspectorSettings } from "../../../inspector/selectors/inspectorSelectors";
import { getActionByUUID, getData, getDontSendDisabled, getTextData, selectedCommands } from "../../atnSelectors";
import { clearAllAction, passSelectedAction, setDataAction, setDontSendDisabledAction, setSelectActionAction } from "../../atnActions";
import { IActionCommandUUID, IActionSetUUID, TSelectActionOperation, TSelectedItem } from "../../atnModel";
import { ActionSetContainer } from "../ActionSetContainer/ActionSetContainer";
import { addDescriptorAction, selectDescriptorAction, setInspectorViewAction, setMainTabAction, setModeTabAction, toggleDescriptorsGroupingAction } from "../../../inspector/actions/inspectorActions";
import { alert, Helpers } from "../../../inspector/classes/Helpers";
import { str as crc } from "crc-32";
import PS from "photoshop";
import SP from "react-uxp-spectrum";
import { ActionDescriptor } from "photoshop/dom/CoreModules";


class ATNDecoder extends React.Component<TATNDecoder, IATNDecoderState> { 
	constructor(props: TATNDecoder) {
		super(props);
	}

	private renderSet=()=> {
		const { data } = this.props;
		
		if (!data.length) {
			return (
				<div className="ctaEmpty">
					<span>Please open some Photoshop Action files (.atn)</span>
					{this.renderAddButton()}
				</div>
			);
		}

		return (
			data.map((set,i) => (
				<ActionSetContainer actionSet={set} key={i} />
			))
		);
	}

	private pass = (replace=false) => {
		// eslint-disable-next-line prefer-const
		let { selectedCommands, onPassSelected,onSelectAlchemistDescriptors,dontSendDisabled, allAlchemistDescriptors,settingsAlchemist } = this.props;

		onSelectAlchemistDescriptors("none");

		if (dontSendDisabled) {
			selectedCommands = selectedCommands.filter(c => c.enabled);
		}

		if (selectedCommands.length > settingsAlchemist.maximumItems) {
			alert(`Alchemist can currently show only ${settingsAlchemist.maximumItems} items. Increase limit in Alchemist settings if you want to see ${selectedCommands.length - settingsAlchemist.maximumItems} additional items`);
		}

		selectedCommands.forEach((command, index) => {
			
			const commandParrent = getActionByUUID(rootStore.getState().inspector, command.__uuidParentSet__, command.__uuidParentAction__);
			const descCrc = crc(JSON.stringify(command.descriptor));

			const desc: IDescriptor = {
				calculatedReference: command.descriptor as any,
				crc: descCrc,
				descriptorSettings: {
					dialogOptions: command.showDialogs ? "display" : "dontDisplay",
					modalBehavior: "wait",
					supportRawDataType: true,
					synchronousExecution: false,
				},
				endTime: 0,
				id: Helpers.uuidv4(),
				locked: false,
				originalData: command.descriptor,
				originalReference: {
					type: "listener",
					data: [],
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

	}

	private renderAddButton = () => (
		<div className="button" onClick={async (e) => {
			e.stopPropagation();
			const res = await decodeATN();
			this.props.setData(res);
		}}>
			Read .ATN file
		</div>
	)


	public render(): JSX.Element {

		const { fontSizeSettings, data, setData, textData, onClearAll,selectedCommands, setSelectedItem,onSetDontSendDisabled,dontSendDisabled } = this.props;



		return (
			<div className={`ATNDecoderContainer ${fontSizeSettings}`} key={fontSizeSettings}>
				<div className="info spread flex">
					<div className="tree" onClick={(e) => { e.stopPropagation(); setSelectedItem([""], "none");}}>{this.renderSet()}</div>
					<div className="noShrink">
						<SP.Textarea
							className="infoBlock"
							value={textData}
						/>
					</div>
				</div>
				<div className="buttonBar">
					{this.renderAddButton()}
					<div className={"button " + (!selectedCommands.length ? "disallowed" : "")} onClick={()=>this.pass()}>Add to Alchemist</div>
					<div className={"button " + (!selectedCommands.length ? "disallowed" : "")} onClick={() => this.pass(true)}>Replace in Alchemist</div>
					<SP.Checkbox onChange={()=>onSetDontSendDisabled(!dontSendDisabled)} checked={dontSendDisabled}>{"Don't send disabled"}</SP.Checkbox>
					<div className="spread"></div>
					<div className={"button " + (!data.length ? "disallowed" : "")} onClick={onClearAll}>Clear all</div>
				</div>

				<FooterContainer parentPanel="atnConverter" />
			</div>
		);
	}
}



type TATNDecoder = IATNDecoderProps & IATNDecoderDispatch

interface IATNDecoderState{

}

interface IATNDecoderProps{
	fontSizeSettings: TFontSizeSettings
	data: IActionSetUUID[]
	textData: string
	selectedCommands: IActionCommandUUID[]
	dontSendDisabled: boolean
	allAlchemistDescriptors: IDescriptor[]
	settingsAlchemist: ISettings
}

const mapStateToProps = (state: IRootState): IATNDecoderProps => (state = state as IRootState,{
	fontSizeSettings: getFontSizeSettings(state),
	data: getData(state),
	textData: getTextData(state),
	selectedCommands: selectedCommands(state),
	dontSendDisabled: getDontSendDisabled(state),
	allAlchemistDescriptors: getAllDescriptors(state),
	settingsAlchemist: getInspectorSettings(state),
});

interface IATNDecoderDispatch {
	setData(data: IActionSetUUID[]): void
	onClearAll(): void
	onPassSelected(desc: IDescriptor, replace:boolean): void
	onSelectAlchemistDescriptors(operation: TSelectDescriptorOperation, uuid?: string): void
	setSelectedItem(uuid: TSelectedItem, operation: TSelectActionOperation): void
	onSetDontSendDisabled(value:boolean):void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IATNDecoderDispatch, Record<string, unknown>> = (dispatch): IATNDecoderDispatch => ({
	setData: (data) => dispatch(setDataAction(data)),
	onClearAll: () => dispatch(clearAllAction()),
	onPassSelected: (desc, replace) => {
		dispatch(setMainTabAction("descriptors"));
		dispatch(setModeTabAction("reference"));
		dispatch(setInspectorViewAction("code", "generated"));
		dispatch(toggleDescriptorsGroupingAction("none"));
		dispatch(addDescriptorAction(desc, replace));
	},
	onSelectAlchemistDescriptors: (operation, uuid) => dispatch(selectDescriptorAction(operation, uuid)),
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation, uuid)),
	onSetDontSendDisabled: (value) => dispatch(setDontSendDisabledAction(value)),
});

export const ATNDecoderContainer = connect<IATNDecoderProps, IATNDecoderDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(ATNDecoder);