import React, { Component } from "react";
import { ISettings } from "../../model/types";
import "./Settings.less";

export interface ISettingsProps{
	settings: ISettings
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISettingsDispatch {
	onSetRecordRaw: (value:boolean)=>void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISettingsState{
}

export type TSettings = ISettingsProps & ISettingsDispatch

export class Settings extends Component<TSettings, ISettingsState> {

	constructor(props: TSettings) {
		super(props);

		this.state = {
		};
	}

	
	public render(): React.ReactNode {
		const {settings:{recordRawData: ignoreRawData},onSetRecordRaw } = this.props;
//<sp-checkbox onClick={this.onGroupSame} checked={groupSame ? true : null}>
		return (
			<div className="Settings">
				<div><span className="title">Descriptor settings: </span></div>
				<div className="row">
					<sp-checkbox quiet={true} checked={ignoreRawData ? true : null} onClick={(e:any)=>onSetRecordRaw(e.target.checked)} />				
					<div className="label">Support raw data type (might slow down panel when turned on)</div>
				</div>
			</div>
		);
	}
}