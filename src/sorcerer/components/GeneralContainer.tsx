import "./GeneralContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import {useAppDispatch, useAppSelector} from "../../shared/store";
import PS from "photoshop";
import {TSelectedItem, TSelectActionOperation} from "../../atnDecoder/atnModel";
import {setHostApp, setMainAction, setSelectAction, TSetMainActionPayload, TSetPanelHostActionPayload} from "../sorActions";
import {getManifestGeneric, isGenericModuleVisible} from "../sorSelectors";
import {IManifestInfo} from "../sorModel";

export const General: React.FC = () => {
	const dispatch = useAppDispatch();
	const manifestGeneric = useAppSelector(getManifestGeneric);
	const isGenericVisible = useAppSelector(isGenericModuleVisible);
	const onSetMain = (value: TSetMainActionPayload) => dispatch(setMainAction(value));
	const onSetHost = (app: "PS" | "XD", arg: TSetPanelHostActionPayload) => dispatch(setHostApp(app, arg));

	const renderHostInfo = () => {
		const {host} = manifestGeneric;

		const res = host.map((h, i) =>
			<div key={i} className="host">
				<h4>{h.app}</h4>
				<div className="row">
					Min. version: <SP.Textfield value={h.minVersion} onInput={e => onSetHost(h.app, {minVersion: e.target?.value})} />
				</div>
				<div className="row">
					API version: <SP.Textfield value={h.data.apiVersion.toString()} disabled={true} />
				</div>
			</div>,
		);

		return res;
	};

	if (!isGenericVisible) {
		return null;
	}

	return (
		<div className="GeneralContainerContainer" key="generalPanel">
			<h3>Main</h3>
			<div className="row">
				Manifest version: <SP.Textfield value={manifestGeneric.manifestVersion.toString()} disabled={true} />
			</div>
			<div className="row">
				Plugin name: <SP.Textfield value={manifestGeneric.name} onInput={e => onSetMain({name: e.target?.value})} />
			</div>
			<div className="row">
				Plugin ID: <SP.Textfield value={manifestGeneric.id} onInput={e => onSetMain({id: e.target?.value})} />
			</div>
			<div className="row">
				Main file: <SP.Textfield value={manifestGeneric.main} disabled={true} />
			</div>
			<div className="row">
				Plugin version: <SP.Textfield value={manifestGeneric.version} onInput={e => onSetMain({version: e.target?.value})} />
			</div>
			<h3>Host app</h3>
			{renderHostInfo()}
		</div>
	);
};