import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";

import React from "react";

import "./../../../shared/ThemeVars.css";
import "./../../../shared/styles.less";
import "./SorcererContainer.less";

import SP from "react-uxp-spectrum";
import { TFontSizeSettings } from "../../../inspector/model/types";
import { FooterContainer } from "../../../inspector/components/Footer/FooterContainer";
import { getFontSizeSettings } from "../../../inspector/selectors/inspectorSelectors";
import { setDataAction } from "../../sorActions";
import { IActionSetUUID } from "../../../atnDecoder/atnModel";


class Sorcerer extends React.Component<TSorcerer, ISorcererState> { 
	constructor(props: TSorcerer) {
		super(props);
	}

	public render(): JSX.Element {
		const { fontSizeSettings } = this.props;

		return (
			<div className={`SorcererContainer ${fontSizeSettings}`}>
				<div className="info spread flex">
					<div className="tree">
						<div>general</div>
						<div>first menu item</div>
						<div>second menu item</div>
						<div>third menu item</div>
					</div>
					<div className="noShrink">
						options
					</div>
				</div>
				<div className="buttonBar">
					<div className={"button"}>Add item</div>
					<div className={"button"}>Remove</div>
					<div className={"button"}>Build plugin</div>
					<div className="spread"></div>
					<div className={"button"}>Export as preset</div>
					<div className={"button"}>Import preset</div>
				</div>

				<FooterContainer parentPanel="atnConverter" />
			</div>
		);
	}
}



type TSorcerer = ISorcererProps & ISorcererDispatch

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISorcererState{

}

interface ISorcererProps{
	fontSizeSettings: TFontSizeSettings
}

const mapStateToProps = (state: IRootState): ISorcererProps => (state = state as IRootState,{
	fontSizeSettings: getFontSizeSettings(state),
});

interface ISorcererDispatch {
	setData(data: IActionSetUUID[]): void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ISorcererDispatch, Record<string, unknown>> = (dispatch): ISorcererDispatch => ({
	setData: (data) => dispatch(setDataAction(data)),
});

export const SorcererContainer = connect<ISorcererProps, ISorcererDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Sorcerer);