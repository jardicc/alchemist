import "./CommandContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { TSelectedItem, TSelectActionOperation } from "../../../atnDecoder/atnModel";
import { IRootState } from "../../../shared/store";
import { setCommandAction, setSelectAction, TSetCommandActionPayload } from "../../sorActions";
import { IEntrypointCommand } from "../../sorModel";
import { getActiveCommand } from "../../sorSelectors";

export class Command extends React.Component<TCommandContainer, ICommandContainerState> { 
	constructor(props: TCommandContainer) {
		super(props);
	}

	public render():React.ReactNode {
		const { activeCommand, onSet} = this.props;
		
		if (!activeCommand) { return null;}

		return (
			<div className="CommandContainerContainer">
				<div className="row">
					Label: <SP.Textfield
						value={activeCommand.label.default}
						onInput={e => onSet(activeCommand.$$$uuid, { label: { default: e.target.value } })}
					/>
				</div>
				<div className="row">
					ID: <SP.Textfield
						value={activeCommand.id}
						onInput={e => onSet(activeCommand.$$$uuid, { id: e.target.value })}
					/>
				</div>
			</div>
		);
	}
}

type TCommandContainer = ICommandContainerProps & ICommandContainerDispatch

interface ICommandContainerState {

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
	//setSelectedItem?(uuid:TSelectedItem,operation:TSelectActionOperation): void
	onSet:(uuid:string,value:TSetCommandActionPayload)=>void
}

const mapDispatchToProps = (dispatch: Dispatch): ICommandContainerDispatch => ({
	//setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
	onSet: (uuid, value) => dispatch(setCommandAction(value, uuid)),
	
});

export const CommandContainer = connect<ICommandContainerProps, ICommandContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(Command);