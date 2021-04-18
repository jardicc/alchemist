import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import { getInspectorSettings } from "../../selectors/inspectorSelectors";
import { setFontSizeAction, setMaximumItems, setRecordRawAction } from "../../actions/inspectorActions";

import React, { Component } from "react";
import { ISettings, TFontSizeSettings } from "../../model/types";
import "./Settings.less";

export interface ISettingsProps{
	settings: ISettings
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ISettingsDispatch {
	onSetRecordRaw: (value: boolean) => void
	onSetMaximumItems: (value: string) => void
	onSetFontSize:(value:TFontSizeSettings)=>void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISettingsState{
	maxItemsTempValue: string
	maxItemsFocus: boolean
}

export type TSettings = ISettingsProps & ISettingsDispatch

class Settings extends Component<TSettings, ISettingsState> {

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
		const { settings: { recordRawData: ignoreRawData, maximumItems,fontSize }, onSetRecordRaw,onSetFontSize } = this.props;
		const items: { val: TFontSizeSettings, label: string }[] = [
			{ label: "Tiny", val: "size-tiny" },
			{ label: "Small", val: "size-small" },
			{ label: "Default", val: "size-default" },
			{ label: "Bigger", val: "size-bigger" },
			{ label: "Big", val: "size-big" },
			{ label: "You must be joking", val: "size-youMustBeJoking" }
		];
		const itemsLabels:TFontSizeSettings[] = ["size-tiny", "size-small", "size-default", "size-bigger", "size-big", "size-youMustBeJoking"];
		//<sp-checkbox onClick={this.onGroupSame} checked={groupSame ? true : null}>
		return (
			<div className="Settings">
				<div><span className="title">Descriptor settings: </span></div>
				<div className="row">
					<sp-checkbox quiet={true} checked={ignoreRawData ? true : null} onClick={(e: any) => onSetRecordRaw(e.target.checked)} />
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
				<div className="row">
					<span className="fontSizeLabel">
						Font size: 
					</span>
					<sp-dropdown class="fontSizeDropdown">
						<sp-menu slot="options" onClick={(e:any)=>onSetFontSize(e.target.value)}>
							{
								items.map(item => (
									<sp-menu-item
										key={item.val}
										value={item.val}
										selected={fontSize === item.val ? "selected" : null}
									>{item.label}</sp-menu-item>
								))
							}
						</sp-menu>
					</sp-dropdown>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state: IRootState): ISettingsProps => {
	return {
		settings: getInspectorSettings(state)
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<ISettingsDispatch, Record<string, unknown>> = (dispatch):ISettingsDispatch => {
	return {
		onSetRecordRaw: (value) => dispatch(setRecordRawAction(value)),
		onSetMaximumItems: (value) => dispatch(setMaximumItems(value)),
		onSetFontSize:(value)=>dispatch(setFontSizeAction(value))
	};
};

export const SettingsContainer = connect<ISettingsProps, ISettingsDispatch>(mapStateToProps, mapDispatchToProps)(Settings);

