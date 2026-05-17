import "./Snippet.less";
import SP from "react-uxp-spectrum";
import React from "react";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import PS from "photoshop";
import {TSelectedItem, TSelectActionOperation} from "../../atnDecoder/atnModel";
import {setSelectAction, setSnippetAction, TSetSnippetActionPayload} from "../sorActions";
import {ISnippet} from "../sorModel";
import {getActiveSnippet} from "../sorSelectors";

export const Snippet: React.FC = () => {
	const dispatch = useAppDispatch();
	const activeSnippet = useAppSelector(getActiveSnippet);
	const onSet = (uuid: string, value: TSetSnippetActionPayload) => dispatch(setSnippetAction(value, uuid));

	if (activeSnippet === null) {return null;}

	return (
		<div className="SnippetContainerContainer" key="snippetPanel">
			<div className="row">
				Name: <SP.Textfield value={activeSnippet.label.default} onInput={e => onSet(activeSnippet.$$$uuid, {label: {default: e.target?.value ?? ""}})} />
			</div>
			<div className="row">
				Version: <SP.Textfield value={activeSnippet.version} onInput={e => onSet(activeSnippet.$$$uuid, {version: e.target?.value})} />
			</div>
			<div className="row">
				Author: <SP.Textfield value={activeSnippet.author} onInput={e => onSet(activeSnippet.$$$uuid, {author: e.target?.value})} />
			</div>
			<div className="row">
				Code:
			</div>
			<div className="row codeWrap">
				<SP.Textarea className="snippetCode" value={activeSnippet.code} onInput={e => onSet(activeSnippet.$$$uuid, {code: e.target?.value})} />
			</div>
		</div>
	);
};
