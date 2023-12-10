import "./PanelContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import {connect, useDispatch} from "react-redux";
import {Dispatch} from "redux";
import {IRootState} from "../../../shared/store";
import {IEntrypointPanel, ISnippet} from "../../sorModel";
import {getActivePanel, getAllSnippets} from "../../sorSelectors";
import {assignSnippetToPanelAction, setPanelAction, TSetPanelActionPayload} from "../../sorActions";
import {TActions} from "../../../inspector/actions/inspectorActions";
export class Panel extends React.Component<TPanelContainer, IPanelContainerState> {
	constructor(props: TPanelContainer) {
		super(props);
	}

	public override render(): React.ReactNode {
		const {activePanel, onSet, snippets, onAssignSnippet} = this.props;

		if (!activePanel) {return null;}
		//debugger;
		return (
			<div className="PanelContainerContainer" key="panelPanel">
				<div className="row">
					Label: <SP.Textfield
						value={activePanel.label.default}
						onInput={e => onSet(activePanel.$$$uuid, {label: {default: e?.target?.value ?? ""}})}
					/>
				</div>
				<div className="row">
					ID: <SP.Textfield
						value={activePanel.id}
						onInput={e => onSet(activePanel.$$$uuid, {id: e?.target?.value ?? ""})}
					/>
				</div>
				<div className="row">
					Assigned snippet(s):
				</div>
				<div className="column">
					{snippets.map((checkboxItem, index) => (
						<div className="row" key={index}>
							<SP.Checkbox
								key={checkboxItem.$$$uuid}
								checked={activePanel.$$$snippetUUIDs.includes(checkboxItem.$$$uuid) ? true : undefined}
								onChange={e => onAssignSnippet(activePanel.$$$uuid, e?.target?.checked ? "on" : "off", checkboxItem.$$$uuid)}
							>{checkboxItem.label.default}</SP.Checkbox>
						</div>
					))}
				</div>
			</div>
		);
	}
}

type TPanelContainer = IPanelContainerProps & IPanelContainerDispatch

interface IPanelContainerState {

}

interface IOwn {

}

interface IPanelContainerProps {
	activePanel: IEntrypointPanel | null
	snippets: ISnippet[]
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IPanelContainerProps => (state = state as IRootState, {
	activePanel: getActivePanel(state),
	snippets: getAllSnippets(state),
});

interface IPanelContainerDispatch {
	//setSelectedItem?(uuid:TSelectedItem,operation:TSelectActionOperation): void
	onSet: (uuid: string, value: TSetPanelActionPayload) => void
	onAssignSnippet: (uuid: string, operation: "on" | "off", snippetUuid: string) => void
}

const mapDispatchToProps = (dispatch: Dispatch): IPanelContainerDispatch => ({
	//setSelectedItem: (uuid, operation) => dispatch(setSelectAction(operation,uuid)),

	onSet: (uuid, value) => dispatch(setPanelAction(value, uuid)),
	onAssignSnippet: (uuid, operation, snippetUuid) => dispatch(assignSnippetToPanelAction(operation, uuid, snippetUuid)),
});

export const PanelContainer = connect<IPanelContainerProps, IPanelContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(Panel);