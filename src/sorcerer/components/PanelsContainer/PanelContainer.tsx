import "./PanelContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import PS from "photoshop";
import { TSelectedItem, TSelectActionOperation } from "../../../atnDecoder/atnModel";
import { IEntrypointPanel } from "../../sorModel";
import { getActivePanel } from "../../sorSelectors";
export class Panel extends React.Component<TPanelContainer, IPanelContainerState> { 
	constructor(props: TPanelContainer) {
		super(props);
	}

	public render():React.ReactNode {
		const { activePanel } = this.props;
		
		if (!activePanel) { return null;}

		return (
			<div className="PanelContainerContainer">
				<h3>Panel</h3>
				<div className="row">
					ID: <SP.Textfield value={activePanel.id}  />
				</div>
				<div className="row">
					Label: <SP.Textfield value={activePanel.label.default}  />
				</div>
			</div>
		);
	}
}

type TPanelContainer = IPanelContainerProps & IPanelContainerDispatch

interface IPanelContainerState{

}

interface IOwn{

}

interface IPanelContainerProps{
	activePanel:IEntrypointPanel
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IPanelContainerProps => (state = state as IRootState,{
	activePanel: getActivePanel(state),
});

interface IPanelContainerDispatch {
	setSelectedItem?(uuid:TSelectedItem,operation:TSelectActionOperation): void
}

const mapDispatchToProps = (dispatch:Dispatch):IPanelContainerDispatch => ({
	//setSelectedItem: (uuid, operation) => dispatch(setSelectAction(operation,uuid)),
});

export const PanelContainer = connect<IPanelContainerProps, IPanelContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(Panel);