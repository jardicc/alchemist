import "./GeneralContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import PS from "photoshop";
import { TSelectedItem, TSelectActionOperation } from "../../../atnDecoder/atnModel";
import { setHostApp, setMainAction, setSelectAction, TSetMainActionPayload, TSetPanelHostActionPayload } from "../../sorActions";
import { getManifestGeneric, isGenericModuleVisible } from "../../sorSelectors";
import { IManifestInfo } from "../../sorModel";

export class General extends React.Component<TGeneralContainer, IGeneralContainerState> { 
	constructor(props: TGeneralContainer) {
		super(props);
	}

	private renderHostInfo = () => {
		const { manifestGeneric: { host },onSetHost } = this.props;
		
		const res = host.map((h, i) =>
			<div key={i} className="host">
				<h4>{h.app}</h4>
				<div className="row">
					Min. version: <SP.Textfield value={h.minVersion} onInput={e => onSetHost(h.app, { minVersion: e.target.value })} />
				</div>
				<div className="row">
					API version: <SP.Textfield value={h.data.apiVersion.toString()} disabled={true} />
				</div>
			</div>,
		);

		return res;
	}

	public render():React.ReactNode {
		const { manifestGeneric, isGenericVisible,onSet: onSetMain } = this.props;
		
		if (!isGenericVisible) {
			return null;
		}

		return (
			<div className="GeneralContainerContainer" key="generalPanel">
				<h3>Main</h3>
				<div className="row">
					Manifest version: <SP.Textfield value={manifestGeneric.manifestVersion.toString()} disabled={true}   />
				</div>
				<div className="row">
					Plugin name: <SP.Textfield value={manifestGeneric.name} onInput={e=>onSetMain({name:e.target.value})}  />
				</div>
				<div className="row">
					Plugin ID: <SP.Textfield value={manifestGeneric.id} onInput={e=>onSetMain({id:e.target.value})}  />
				</div>
				<div className="row">
					Main file: <SP.Textfield value={manifestGeneric.main} disabled={true} />
				</div>
				<div className="row">
					Plugin version: <SP.Textfield value={manifestGeneric.version} onInput={e=>onSetMain({version:e.target.value})}   />
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
	isGenericVisible:boolean
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IGeneralContainerProps => (state = state as IRootState,{
	//general: ownProps.general,
	manifestGeneric: getManifestGeneric(state),
	isGenericVisible: isGenericModuleVisible(state),
});

interface IGeneralContainerDispatch {
	//setSelectedItem?(uuid:TSelectedItem,operation:TSelectActionOperation): void
	onSet: (value: TSetMainActionPayload) => void
	onSetHost: (app: "PS"|"XD", arg: TSetPanelHostActionPayload) => void
}

const mapDispatchToProps = (dispatch: Dispatch): IGeneralContainerDispatch => ({
	onSet: (value) => dispatch(setMainAction(value)),
	onSetHost:(app,arg)=>dispatch(setHostApp(app,arg)),
	//setSelectedItem: (uuid, operation) => dispatch(setSelectAction(operation,uuid)),
});

export const GeneralContainer = connect<IGeneralContainerProps, IGeneralContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(General);