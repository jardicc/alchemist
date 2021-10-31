import "./GeneralContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import PS from "photoshop";
import { TSelectedItem, TSelectActionOperation } from "../../../atnDecoder/atnModel";
import { setSelectActionAction } from "../../sorActions";
import { getManifestGeneric } from "../../sorSelectors";
import { IManifestInfo } from "../../sorModel";

export class General extends React.Component<TGeneralContainer, IGeneralContainerState> { 
	constructor(props: TGeneralContainer) {
		super(props);
	}

	private renderHostInfo = () => {
		const { manifestGeneric: { host } } = this.props;
		
		const res = host.map((h, i) =>
			<div key={i} className="host">
				<h4>{h.app}</h4>
				<div className="row">
					Min. version: <SP.Textfield value={h.minVersion} />
				</div>
				<div className="row">
					API version: <SP.Textfield value={h.data.apiVersion.toString()} disabled={true} />
				</div>
			</div>,
		);

		return res;
	}

	public render():React.ReactNode {
		const {manifestGeneric } = this.props;

		return (
			<div className="GeneralContainerContainer">
				<h3>Main</h3>
				<div className="row">
					Manifest version: <SP.Textfield value={manifestGeneric.manifestVersion.toString()} disabled={true}   />
				</div>
				<div className="row">
					Plugin name: <SP.Textfield value={manifestGeneric.name}  />
				</div>
				<div className="row">
					Plugin ID: <SP.Textfield value={manifestGeneric.id}  />
				</div>
				<div className="row">
					Main file: <SP.Textfield value={manifestGeneric.main}  />
				</div>
				<div className="row">
					Version: <SP.Textfield value={manifestGeneric.version}  />
				</div>
				<h3>Host app</h3>
				{this.renderHostInfo()}
			</div>
		);
	}
}

type TGeneralContainer = IGeneralContainerProps & IGeneralContainerDispatch

interface IGeneralContainerState{

}

interface IOwn{
	
}

interface IGeneralContainerProps{
	manifestGeneric: IManifestInfo
	//general:any
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IGeneralContainerProps => (state = state as IRootState,{
	//general: ownProps.general,
	manifestGeneric: getManifestGeneric(state),
});

interface IGeneralContainerDispatch {
	setSelectedItem(uuid:TSelectedItem,operation:TSelectActionOperation): void
}

const mapDispatchToProps = (dispatch:Dispatch):IGeneralContainerDispatch => ({
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
});

export const GeneralContainer = connect<IGeneralContainerProps, IGeneralContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(General);