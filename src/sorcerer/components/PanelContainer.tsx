import "./PanelContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import {IEntrypointPanel, ISnippet} from "../sorModel";
import {getActivePanel, getAllSnippets} from "../sorSelectors";
import {assignSnippetToPanelAction, setPanelAction, TSetPanelActionPayload} from "../sorActions";
export const Panel: React.FC = () => {
	const dispatch = useAppDispatch();
	const activePanel = useAppSelector(getActivePanel);
	const snippets = useAppSelector(getAllSnippets);
	const onSet = (uuid: string, value: TSetPanelActionPayload) => dispatch(setPanelAction(value, uuid));
	const onAssignSnippet = (uuid: string, operation: "on" | "off", snippetUuid: string) => dispatch(assignSnippetToPanelAction(operation, uuid, snippetUuid));

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
};
