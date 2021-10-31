import "./GeneralContainerContainer.less";

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import PS from "photoshop";
import { TSelectedItem, TSelectActionOperation } from "../../../atnDecoder/atnModel";
import { setSelectActionAction } from "../../sorActions";
import { getManifestGeneric } from "../../sorSelectors";
import { IManifestInfo } from "../../sorModel";
export class GeneralContainer extends React.Component<TGeneralContainer, IGeneralContainerState> { 
	constructor(props: TGeneralContainer) {
		super(props);
	}

	public render():React.ReactNode {
		const {general } = this.props;

		return (
			<div className="GeneralContainerContainer">
				
			</div>
		);
	}
}

type TGeneralContainer = IGeneralContainerProps & IGeneralContainerDispatch

interface IGeneralContainerState{

}

interface IOwn{
	general: any
}

interface IGeneralContainerProps{
	general:any
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IGeneralContainerProps => (state = state as IRootState,{
	general: ownProps.general,
});

interface IGeneralContainerDispatch {
	setSelectedItem(uuid:TSelectedItem,operation:TSelectActionOperation): void
}

const mapDispatchToProps = (dispatch:Dispatch):IGeneralContainerDispatch => ({
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
});

export const GeneralContainerContainer = connect<IGeneralContainerProps, IGeneralContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(GeneralContainer);