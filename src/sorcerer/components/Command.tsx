import "./Command.less";
import SP from "react-uxp-spectrum";
import React from "react";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {getActiveCommand, getAllSnippets} from "../sorSelectors";
import {TSetCommandActionPayload, sorSlice} from "../sorSlice";

const {setCommand} = sorSlice.actions;

export const Command: React.FC = () => {
	const dispatch = useAppDispatch();
	const activeCommand = useAppSelector(getActiveCommand);
	const snippets = useAppSelector(getAllSnippets);
	const onSet = (uuid: string, value: TSetCommandActionPayload) => dispatch(setCommand(value, uuid));

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
};
