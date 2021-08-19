import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";

import React from "react";

import "./../../../shared/ThemeVars.css";
import "./../../../shared/styles.less";
import "./ATNDecoderContainer.less";

import { doIt } from "../../../atnDecoder/classes/ATNDecoder";
import { FooterContainer } from "../../../inspector/components/Footer/FooterContainer";
import { IDescriptor, TFontSizeSettings } from "../../../inspector/model/types";
import { getFontSizeSettings } from "../../../inspector/selectors/inspectorSelectors";
import { getData, getTextData, selectedCommands } from "../../selectors/atnSelectors";
import { clearAllAction, passSelectedAction, setDataAction } from "../../actions/atnActions";
import { IActionCommandUUID, IActionSetUUID } from "../../types/model";
import { ActionSetContainer } from "../ActionSetContainer/ActionSetContainer";
import { addDescriptorAction } from "../../../inspector/actions/inspectorActions";
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

	private pass = () => {
		const { selectedCommands, onPassSelected } = this.props;

		selectedCommands.forEach(command => {

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

			onPassSelected(desc);
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
							maxLength={Number.MAX_SAFE_INTEGER}
							className="infoBlock"
							defaultValue={textData}
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
					<div className="button" onClick={this.pass}>Pass selected to Alchemist</div>
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
	onPassSelected(desc:IDescriptor):void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IATNDecoderDispatch, Record<string, unknown>> = (dispatch):IATNDecoderDispatch => ({
	setData: (data) => dispatch(setDataAction(data)),
	onClearAll: () => dispatch(clearAllAction()),
	onPassSelected: (desc) => dispatch(addDescriptorAction(desc)),
});

export const ATNDecoderContainer = connect<IATNDecoderProps, IATNDecoderDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(ATNDecoder);