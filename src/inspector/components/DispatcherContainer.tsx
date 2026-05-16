import {useAppDispatch, useAppSelector} from "../../shared/store";
import {setDispatcherValueAction, addDescriptorAction} from "../actions/inspectorActions";
import {getDispatcherSnippet} from "../selectors/dispatcherSelectors";
import {getInspectorSettings} from "../selectors/inspectorSelectors";

/* eslint-disable quotes */
import React from "react";
import "./DispatcherContainer.less";
import {Helpers} from "../classes/Helpers";
import {IDescriptor, IRefDispatcher, ISettings} from "../model/types";
import {RawDataConverter} from "../classes/RawDataConverter";
import {getInitialState} from "../inspInitialState";
import {str as crc} from "crc-32";
import Sval from "sval";
import SP from "react-uxp-spectrum";
import uxp from "uxp";
import os from "os";

export const Dispatcher: React.FC = () => {
	const dispatch = useAppDispatch();
	const snippet = useAppSelector(getDispatcherSnippet);
	const settings = useAppSelector(getInspectorSettings);
	const setDispatcherValue = (value: string) => dispatch(setDispatcherValueAction(value));
	const onAddDescriptor = (desc: IDescriptor) => dispatch(addDescriptorAction(desc, false));

	const change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setDispatcherValue(e.currentTarget.value);
	};

	const send = async () => {
		try {
			const startTime = Date.now();
			let data: any;
			try {
				data = await (async function () {
					const interpreter = new Sval({
						ecmaVer: 9,
						sandBox: false,
					});
					interpreter.import("uxp", uxp);
					interpreter.import("os", os);

					interpreter.run(`
						"use strict";
						async function userCode(){${snippet}};
						exports.returnValue = userCode();
					`);
					const res = await interpreter.exports.returnValue;
					return res;
				})();
			} catch (e: any) {
				data = {error: e.stack};
			}
			const endTime = Date.now();

			const originalReference: IRefDispatcher = {
				type: "dispatcher",
			};
			const result: IDescriptor = {
				endTime,
				startTime,
				id: crypto.randomUUID(),
				locked: false,
				//crc:Date.now()+Math.random(),
				crc: crc(JSON.stringify(data || "__empty__")),
				recordedData: RawDataConverter.replaceArrayBuffer(data),
				originalReference,
				pinned: false,
				selected: false,
				renameMode: false,
				playAbleData: data,
				title: "Dispatched",
				descriptorSettings: settings.initialDescriptorSettings,
			};

			//this.props.setLastHistoryID;
			onAddDescriptor(result);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className="Dispatcher">
			<div className="help">Use <code>{`return`}</code> to add result into descriptor list. E.g. <code>{`return await batchPlay([{_obj:"invert"}])`}</code><br /></div>
			<div className="textareaWrap">
				<SP.Textarea value={snippet} onInput={change as any} placeholder={getInitialState().dispatcher.snippets[0].content} />
			</div>
			<div className="button" onClick={send}>Send</div>
		</div>
	);
};