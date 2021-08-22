import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";

import React from "react";

import "./../../../shared/ThemeVars.css";
import "./../../../shared/styles.less";
import "./ATNDecoderContainer.less";

import { doIt } from "../../../atnDecoder/classes/ATNDecoder";
import { FooterContainer } from "../../../inspector/components/Footer/FooterContainer";
import { IDescriptor, TFontSizeSettings, TSelectDescriptorOperation } from "../../../inspector/model/types";
import { getFontSizeSettings } from "../../../inspector/selectors/inspectorSelectors";
import { getData, getTextData, selectedCommands } from "../../selectors/atnSelectors";
import { clearAllAction, passSelectedAction, setDataAction } from "../../actions/atnActions";
import { IActionCommandUUID, IActionSetUUID } from "../../types/model";
import { ActionSetContainer } from "../ActionSetContainer/ActionSetContainer";
import { addDescriptorAction, selectDescriptorAction, setInspectorViewAction, setMainTabAction, setModeTabAction } from "../../../inspector/actions/inspectorActions";
import { Helpers } from "../../../inspector/classes/Helpers";
import { str as crc } from "crc-32";


class ATNDecoder extends React.Component<TATNDecoder, IATNDecoderState> { 
	constructor(props: TATNDecoder) {
		super(props);
	}

	private renderSet=()=> {
		const {data } = this.props;
		return (
			data.map((set,i) => (
				<ActionSetContainer actionSet={set} key={i} />
			))
		);
	}

	private pass = (replace=false) => {
		const { selectedCommands, onPassSelected,onSelectAlchemistDescriptors } = this.props;

		onSelectAlchemistDescriptors("none");

		selectedCommands.forEach((command,index) => {

			const descCrc = crc(JSON.stringify(command.descriptor));

			const desc: IDescriptor = {
				calculatedReference: command.descriptor,
				crc: descCrc,
				descriptorSettings: {
					dialogOptions: "dontDisplay",
					modalBehavior: "wait",
					supportRawDataType: true,
					synchronousExecution: true,
				},
				endTime: 0,
				id: Helpers.uuidv4(),
				locked: false,
				originalData: command.descriptor,
				originalReference: {
					type: "listener",
					data: [
						{
							subType: "listenerCategory",
							content: {
								filterBy: "off",
								value: "listener",
							},
						},
					],
				},
				pinned: false,
				renameMode: false,
				selected: true,
				startTime: 0,
				title: command.commandName,
			};

			const cleanOld = index === 0 && replace;
			onPassSelected(desc, cleanOld);
		});

	}


	public render(): JSX.Element {

		const { fontSizeSettings, data, setData, textData, onClearAll } = this.props;



		return (
			<div className={`ATNDecoderContainer ${fontSizeSettings}`}>
				<div className="info spread flex">
					<div className="tree">{this.renderSet()}</div>
					<div className="noShrink">
						<textarea
							readOnly={true}
							maxLength={Number.MAX_SAFE_INTEGER}
							className="infoBlock"
							value={textData}
						/>
					</div>
				</div>
				<div className="buttonBar">
					<div className="button" onClick={onClearAll}>Clear all</div>
					<div className="button" onClick={async () => {
						const res = await doIt();
						setData(res);
					}}>
						Read .ATN file
					</div>
					<div className="button" onClick={()=>this.pass()}>Add selected to Alchemist</div>
					<div className="button" onClick={()=>this.pass(true)}>Replace selected in Alchemist</div>
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
	selectedCommands:IActionCommandUUID[]
}

const mapStateToProps = (state: IRootState): IATNDecoderProps => (state = state as IRootState,{
	fontSizeSettings: getFontSizeSettings(state),
	data: getData(state),
	textData: getTextData(state),
	selectedCommands: selectedCommands(state),
});

interface IATNDecoderDispatch {
	setData(data: IActionSetUUID): void
	onClearAll(): void
	onPassSelected(desc: IDescriptor, replace:boolean): void
	onSelectAlchemistDescriptors(operation: TSelectDescriptorOperation, uuid?: string):void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IATNDecoderDispatch, Record<string, unknown>> = (dispatch):IATNDecoderDispatch => ({
	setData: (data) => dispatch(setDataAction(data)),
	onClearAll: () => dispatch(clearAllAction()),
	onPassSelected: (desc, replace) => {
		dispatch(setMainTabAction("descriptors"));
		dispatch(setModeTabAction("reference"));
		dispatch(setInspectorViewAction("code", "generated"));
		dispatch(addDescriptorAction(desc, replace));
	},
	onSelectAlchemistDescriptors: (operation,uuid) => dispatch(selectDescriptorAction(operation,uuid)),
});

export const ATNDecoderContainer = connect<IATNDecoderProps, IATNDecoderDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(ATNDecoder);