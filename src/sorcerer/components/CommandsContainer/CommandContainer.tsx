import "./CommandContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { TSelectedItem, TSelectActionOperation } from "../../../atnDecoder/atnModel";
import { IRootState } from "../../../shared/store";
import { setSelectActionAction } from "../../sorActions";
import { IEntrypointCommand } from "../../sorModel";
import { getActiveCommand } from "../../sorSelectors";

export class Command extends React.Component<TCommandContainer, ICommandContainerState> { 
	constructor(props: TCommandContainer) {
		super(props);
	}

	public render():React.ReactNode {
		const { activeCommand } = this.props;
		
		if (!activeCommand) { return null;}

		return (
			<div className="CommandContainerContainer">
				<h3>Command</h3>
				<div className="row">
					ID: <SP.Textfield value={activeCommand.id}  />
				</div>
				<div className="row">
					Label: <SP.Textfield value={activeCommand.label.default}  />
				</div>
			</div>
		);
	}
}

type TCommandContainer = ICommandContainerProps & ICommandContainerDispatch

interface ICommandContainerState{

}

interface IOwn{

}

interface ICommandContainerProps{
	activeCommand:IEntrypointCommand
	//activeCommand:IEntrypointCommand
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): ICommandContainerProps => (state = state as IRootState,{
	activeCommand: getActiveCommand(state),
});

interface ICommandContainerDispatch {
	setSelectedItem(uuid:TSelectedItem,operation:TSelectActionOperation): void
}

const mapDispatchToProps = (dispatch: Dispatch): ICommandContainerDispatch => ({
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
});

export const CommandContainer = connect<ICommandContainerProps, ICommandContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(Command);