import "./CommandContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {TSelectedItem, TSelectActionOperation} from "../../../atnDecoder/atnModel";
import {IRootState} from "../../../shared/store";
import {setCommandAction, setSelectAction, TSetCommandActionPayload} from "../../sorActions";
import {IEntrypointCommand, ISnippet} from "../../sorModel";
import {getActiveCommand, getAllSnippets} from "../../sorSelectors";

export class Command extends React.Component<TCommandContainer, ICommandContainerState> {
	constructor(props: TCommandContainer) {
		super(props);
	}

	public render(): React.ReactNode {
		const {activeCommand, onSet, snippets} = this.props;

		if (!activeCommand) {return null;}

		return (
			<div className="CommandContainerContainer" key="commandPanel">
				<div className="row">
					Label: <SP.Textfield
						value={activeCommand.label.default}
						onInput={e => onSet(activeCommand.$$$uuid, {label: {default: e.target?.value ?? ""}})}
					/>
				</div>
				<div className="row">
					ID: <SP.Textfield
						value={activeCommand.id}
						onInput={e => onSet(activeCommand.$$$uuid, {id: e.target?.value})}
					/>
				</div>
				<div className="row">
					Assigned snippet:
					<SP.Dropdown>
						<SP.Menu slot="options" onChange={(e: any) => {onSet(activeCommand.$$$uuid, {$$$snippetUUID: e.target.value});}}>
							{snippets.map(item => (
								<SP.MenuItem
									key={item.$$$uuid}
									value={item.$$$uuid}
									selected={activeCommand.$$$snippetUUID === item.$$$uuid ? true : undefined}
								>{item.label.default}</SP.MenuItem>
							))}
						</SP.Menu>
					</SP.Dropdown>
				</div>
			</div>
		);
	}
}

type TCommandContainer = ICommandContainerProps & ICommandContainerDispatch

interface ICommandContainerState {

}

interface IOwn {

}

interface ICommandContainerProps {
	activeCommand: IEntrypointCommand | null
	snippets: ISnippet[]
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): ICommandContainerProps => (state = state as IRootState, {
	activeCommand: getActiveCommand(state),
	snippets: getAllSnippets(state),
});

interface ICommandContainerDispatch {
	onSet: (uuid: string, value: TSetCommandActionPayload) => void
}

const mapDispatchToProps = (dispatch: Dispatch): ICommandContainerDispatch => ({
	onSet: (uuid, value) => dispatch(setCommandAction(value, uuid)),
});

export const CommandContainer = connect<ICommandContainerProps, ICommandContainerDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(Command);