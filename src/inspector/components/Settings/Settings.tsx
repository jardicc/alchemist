import React, { Component } from "react";
import { ISettings } from "../../model/types";
import "./Settings.less";

export interface ISettingsProps{
	settings: ISettings
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISettingsDispatch {
	onSetRecordRaw: (value: boolean) => void
	onSetMaximumItems:(value:string)=>void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISettingsState{
	maxItemsTempValue: string
	maxItemsFocus: boolean
}

export type TSettings = ISettingsProps & ISettingsDispatch

export class Settings extends Component<TSettings, ISettingsState> {

	constructor(props: TSettings) {
		super(props);

		this.state = {
			maxItemsTempValue: this.props.settings.maximumItems.toString(),
			maxItemsFocus: false
		};
	}

	private setMaxItems = (value: string, focus = this.state.maxItemsFocus) => {
		this.setState({
			...this.state,
			maxItemsTempValue: value,
			maxItemsFocus: focus
		});
	}
	
	public render(): React.ReactNode {
		const {settings:{recordRawData: ignoreRawData,maximumItems},onSetRecordRaw} = this.props;
		//<sp-checkbox onClick={this.onGroupSame} checked={groupSame ? true : null}>
		return (
			<div className="Settings">
				<div><span className="title">Descriptor settings: </span></div>
				<div className="row">
					<sp-checkbox quiet={true} checked={ignoreRawData ? true : null} onClick={(e:any)=>onSetRecordRaw(e.target.checked)} />				
					<div className="label">Support raw data type (might slow down panel when turned on)</div>
				</div>

				<div className="row">
					<label>Max. descriptors:
						<input
							type="number"
							required={true}
							minLength={1}
							maxLength={5}
							min={3}
							max={99999}
							value={this.state.maxItemsFocus ? this.state.maxItemsTempValue : maximumItems} 
							onChange={e => this.setMaxItems(e.currentTarget.value)}
							onBlur={e => {
								this.setMaxItems(maximumItems.toString(), false);
								this.props.onSetMaximumItems(e.currentTarget.value);
							}}
							onFocus={() => this.setMaxItems(maximumItems.toString(), true)}
						/>
					</label>
				</div>
			</div>
		);
	}
}