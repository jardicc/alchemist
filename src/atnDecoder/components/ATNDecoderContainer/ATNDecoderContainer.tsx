import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";

import React from "react";

import "./../../../shared/ThemeVars.css";
import "./../../../shared/styles.less";
import "./ATNDecoderContainer.less";

import { doIt } from "../../../atnDecoder/classes/ATNDecoder";
import { FooterContainer } from "../../../inspector/components/Footer/FooterContainer";
import { TFontSizeSettings } from "../../../inspector/model/types";
import { getFontSizeSettings } from "../../../inspector/selectors/inspectorSelectors";
import { getData, getTextData } from "../../selectors/atnSelectors";
import { setDataAction } from "../../actions/atnActions";
import { IActionSetUUID } from "../../types/model";
import { ActionSetContainer } from "../ActionSetContainer/ActionSetContainer";


class ATNDecoder extends React.Component<TATNDecoder, IATNDecoderState> { 
	constructor(props: TATNDecoder) {
		super(props);
	}

	private renderSet() {
		const {data } = this.props;
		return (
			data.map((set,i) => (
				<ActionSetContainer actionSet={set} key={i} />
			))
		);
	}


	public render(): JSX.Element {

		const { fontSizeSettings, data, setData, textData } = this.props;



		return (
			<div className={`ATNDecoderContainer ${fontSizeSettings}`}>
				<div className="info spread flex">
					<div className="tree">{this.renderSet()}</div>
					<div className="noShrink">
						<textarea
							maxLength={Number.MAX_SAFE_INTEGER}
							className="infoBlock"
							defaultValue={textData}
						/>
					</div>
				</div>
				<div className="button" onClick={async () => {
					const res = await doIt();
					setData(res);
				}}>
					Read .ATN file
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
	textData:string
}

const mapStateToProps = (state: any): IATNDecoderProps => (state = state as IRootState,{
	fontSizeSettings: getFontSizeSettings(state),
	data: getData(state),
	textData:getTextData(state),
});

interface IATNDecoderDispatch {
	setData(data:IActionSetUUID):void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IATNDecoderDispatch, Record<string, unknown>> = (dispatch):IATNDecoderDispatch => ({
	setData: (data) => dispatch(setDataAction(data)),
});

export const ATNDecoderContainer = connect<IATNDecoderProps, IATNDecoderDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(ATNDecoder);