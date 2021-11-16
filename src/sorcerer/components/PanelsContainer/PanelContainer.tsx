import "./PanelContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import { IEntrypointPanel } from "../../sorModel";
import { getActivePanel } from "../../sorSelectors";
import { setPanelAction, TSetPanelActionPayload } from "../../sorActions";
export class Panel extends React.Component<TPanelContainer, IPanelContainerState> { 
	constructor(props: TPanelContainer) {
		super(props);
	}

	public render(): React.ReactNode {
		const { activePanel, onSet } = this.props;
		
		if (!activePanel) { return null; }

		return (
			<div className="PanelContainerContainer">
				<div className="row">
					Label: <SP.Textfield
						value={activePanel.label.default}
						onInput={e => onSet(activePanel.$$$uuid, { label: { default: e.target.value } })}
					/>
				</div>
				<div className="row">
					ID: <SP.Textfield
						value={activePanel.id}
						onInput={e => onSet(activePanel.$$$uuid, { id: e.target.value })}
					/>
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
	//setSelectedItem?(uuid:TSelectedItem,operation:TSelectActionOperation): void
	onSet: (uuid: string, value: TSetPanelActionPayload) => void
}

const mapDispatchToProps = (dispatch: Dispatch): IPanelContainerDispatch => ({
	//setSelectedItem: (uuid, operation) => dispatch(setSelectAction(operation,uuid)),
	onSet: (uuid, value) => dispatch(setPanelAction(value, uuid)),
});

export const PanelContainer = connect<IPanelContainerProps, IPanelContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(Panel);