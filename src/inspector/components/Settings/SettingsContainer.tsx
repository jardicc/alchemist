import { connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import { getInspectorSettings } from "../../selectors/inspectorSelectors";
import { setFontSizeAction, setMaximumItems, setNeverRecordActionNamesAction, setRecordRawAction } from "../../actions/inspectorActions";
import SP from "react-uxp-spectrum";
import React, { Component } from "react";
import { ISettings, TFontSizeSettings } from "../../model/types";
import "./Settings.less";
import { Dispatch } from "redux";

class Settings extends Component<TSettings, ISettingsState> {

	constructor(props: TSettings) {
		super(props);

		this.state = {
			maxItemsTempValue: this.props.settings.maximumItems.toString(),
			maxItemsFocus: false,
		};
	}

	private setMaxItems = (value: string, focus = this.state.maxItemsFocus) => {
		this.setState({
			...this.state,
			maxItemsTempValue: value,
			maxItemsFocus: focus,
		});
	}
	
	public render(): React.ReactNode {
		const { settings: { makeRawDataEasyToInspect: ignoreRawData, maximumItems,fontSize,neverRecordActionNames }, onSetRecordRaw,onSetFontSize, onNeverRecordActionNamesChanged } = this.props;
		const items: { val: TFontSizeSettings, label: string }[] = [
			{ label: "Tiny", val: "size-tiny" },
			{ label: "Small", val: "size-small" },
			{ label: "Default", val: "size-default" },
			{ label: "Bigger", val: "size-bigger" },
			{ label: "Big", val: "size-big" },
			{ label: "You must be joking", val: "size-youMustBeJoking" },
		];
		return (
			<div className="Settings">
				<div><span className="title">Descriptor settings: </span></div>
				<div className="row">

					<SP.Checkbox size="s" checked={ignoreRawData ? true : undefined} onChange={(e) => onSetRecordRaw(!!e.target?.checked)} />
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
					<SP.Dropdown className="fontSizeDropdown" >
						<SP.Menu slot="options" onChange={e => onSetFontSize(items[e.target?.selectedIndex ?? 0].val)}>
							{
								items.map(item => (
									<SP.MenuItem
										key={item.val}
										selected={fontSize === item.val ? true : undefined}
									>{item.label}</SP.MenuItem>
								))
							}
						</SP.Menu>
					</SP.Dropdown>
				</div>
				<div className="row">
					<div>
						<h3>Hard ignore action names</h3>
						<span>
							Events that never will be recorded. No matter what you will set in include/exclude filter. One per line, no quotes, no commas or semicolons. Will Not affect already recorded items.
						</span>
						<div>
							<textarea className="neverRecordActionNamesArea" onChange={e=>onNeverRecordActionNamesChanged(e.currentTarget.value)} defaultValue={neverRecordActionNames.join("\n")} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}




type TSettings = ISettingsProps & ISettingsDispatch

interface ISettingsState{
	maxItemsTempValue: string
	maxItemsFocus: boolean
}

interface ISettingsProps{
	settings: ISettings
}

const mapStateToProps = (state: IRootState): ISettingsProps => ({	
	settings: getInspectorSettings(state),	
});

interface ISettingsDispatch {
	onSetRecordRaw: (value: boolean) => void
	onSetMaximumItems: (value: string) => void
	onSetFontSize: (value: TFontSizeSettings) => void
	onNeverRecordActionNamesChanged:(value:string)=>void
}

const mapDispatchToProps = (dispatch:Dispatch): ISettingsDispatch => ({
	onSetRecordRaw: (value) => dispatch(setRecordRawAction(value)),
	onSetMaximumItems: (value) => dispatch(setMaximumItems(value)),
	onSetFontSize: (value) => dispatch(setFontSizeAction(value)),
	onNeverRecordActionNamesChanged:(value)=>dispatch(setNeverRecordActionNamesAction(value)),
});

export const SettingsContainer = connect<ISettingsProps, ISettingsDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Settings);