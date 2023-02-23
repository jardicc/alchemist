import { connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import { getActiveDescriptors, getAutoSelectedUUIDs, getInspectorSettings, getSettingsVisible } from "../../selectors/inspectorSelectors";
import { setDescriptorOptionsAction, setFontSizeAction, setMaximumItems, setNeverRecordActionNamesAction, setRecordRawAction, setSettingsAction, toggleAccordion, toggleSettingsAction } from "../../actions/inspectorActions";
import SP from "react-uxp-spectrum";
import React, { Component } from "react";
import { IDescriptor, IDescriptorSettings, ISettings, TFontSizeSettings } from "../../model/types";
import "./Settings.less";
import { Dispatch } from "redux";
import { Settings as SettingsClass } from "../../../inspector/classes/Settings";
import {getDescriptorOptions} from "../../selectors/inspectorCodeSelectors";
import {Accordion} from "../Accordion/Accordion";

class Settings extends Component<TSettings, ISettingsState> {

	constructor(props: TSettings) {
		super(props);
	}

	private levelDelay: number | null = null;

	private common = (options: Partial<IDescriptorSettings>) => {
		const {autoSelectedUUIDs, selected, onSetDescriptorOptions: onSetOptions} = this.props;
		if (autoSelectedUUIDs?.length) {
			onSetOptions("default", options);
		} else {
			onSetOptions(selected.map(item => item.id), options);
		}
	}

	private renderOptionsScope = (): React.ReactNode => {
		const auto = this.props.autoSelectedUUIDs;

		if (auto?.length) {
			return (
				<>Will affect all new items</>
			);
		} else {
			return (<>Will change {this.props.selected?.length ?? 0} selected item(s)</>);
		}
	}

	private onSynchronousExecution = (e: any) => {
		let value = e.currentTarget.value;
		if (value === "default") {
			value = null;
		} else {
			value = value === "true";
		}
		this.common({synchronousExecution: value});
	}

	private onSetDialogOptions = (e: any) => {
		const value = e.currentTarget.value;
		this.common({dialogOptions: (value === "default" ? null : value)});
	}

	private onSetModalBehavior = (e: any) => {
		const value = e.currentTarget.value;
		this.common({modalBehavior: (value === "default" ? null : value)});
	}
	
	private onSetSupportRawDataType = (e: any) => {
		const value = e.target.checked;
		this.common({supportRawDataType: !!value});
	}

	private onSetIndent = (e: any) => {
		const value = e.currentTarget.value;
		this.props.onSetGlobalOptions({indent: value});
	}

	private onSetCodeWrappers = (e:any) => {
		if (this.levelDelay) {
			clearTimeout(this.levelDelay);			
		}
		const value = this.wrappersString(e.target.value);

		this.levelDelay = window.setTimeout(() => {
			this.props.onSetGlobalOptions({
				codeWrappers:value,
			});
		}, 50);
	}

	private get wrappersValue():number {
		switch (this.props.settings.codeWrappers) {
			case "modal":
				return 0;
			case "batchPlay":
				return 1;
			case "array":
				return 2;
			case "objects":
				return 3;
		}
	}

	private wrappersString(num:0|1|2|3) {
		switch (num) {
			case 0:
				return "modal";
			case 1:
				return "batchPlay";
			case 2:
				return "array";
			case 3:
				return "objects";
		}
	}

	private get wrappersLabel():string {
		switch (this.props.settings.codeWrappers) {
			case "modal":
				return "Execute as modal";
			case "batchPlay":
				return "Batch play";
			case "array":
				return "Array of descriptors";
			case "objects":
				return "Just objects";
		}
	}

	private onSetImports = (e:any) => {
		this.props.onSetGlobalOptions({codeImports:e.target?.checked ? "require" : "none"});
	}
	
	public render(): React.ReactNode {
		const {settings: {makeRawDataEasyToInspect: ignoreRawData, maximumItems, fontSize, neverRecordActionNames, accordionExpandedIDs}, onSetRecordRaw, onSetFontSize, onNeverRecordActionNamesChanged} = this.props;
		const {onSetGlobalOptions, settingsVisible: visible, setToggleSettings, onToggleAccordion} = this.props;
		const {dialogOptions, modalBehavior, synchronousExecution, supportRawDataType} = this.props.descriptorSettings;
		const {indent, singleQuotes, hideDontRecord, hideForceNotify, hide_isCommand,codeImports,codeWrappers} = this.props.globalSettings;
		
		const items: {val: TFontSizeSettings, label: string}[] = [
			{label: "Tiny", val: "size-tiny"},
			{label: "Small", val: "size-small"},
			{label: "Default", val: "size-default"},
			{label: "Bigger", val: "size-bigger"},
			{label: "Big", val: "size-big"},
			{label: "You must be joking", val: "size-youMustBeJoking"},
		];

		const btnSettings = (
			<div className={"FilterButton settings semi"} title="Show settings" onClick={setToggleSettings} style={{position: "fixed", right: "1.5em", top: 0}}>
				<div className="icon flex row">{/*<IconCog />&nbsp;*/}<span>×</span></div>
			</div>
		);

		SettingsClass.setSpectrumComponentSize(fontSize);

		return (
			<div className="Settings">
				<h3 className="mainHeading">SETTINGS</h3>
				{visible && btnSettings}

				<Accordion id="batchPlaySettings" expanded={accordionExpandedIDs} onChange={onToggleAccordion} header="Batch play">
					<div className="column">
						<span className="scope">{this.renderOptionsScope()}</span>
						<div className="column">
							<div className="label">synchronousExecution</div>
							<SP.Dropdown quiet={false} className="fullW">
								<SP.Menu slot="options" onChange={this.onSynchronousExecution}>
									<SP.MenuItem key={"true"} value={"true"} selected={(synchronousExecution === true) ? true : undefined}>true</SP.MenuItem>
									<SP.MenuItem key={"false"} value={"false"} selected={(synchronousExecution === false) ? true : undefined}>false</SP.MenuItem>
									<SP.MenuItem key={"default"} value={"default"} selected={(synchronousExecution === null) ? true : undefined}>Default</SP.MenuItem>
								</SP.Menu>
							</SP.Dropdown>
						</div>
						<div className="column">
							<div className="label">dialogOptions</div>
							<SP.Dropdown quiet={false} className="fullW">
								<SP.Menu slot="options" onChange={this.onSetDialogOptions}>
									<SP.MenuItem key={"silent"} value={"silent"} selected={(dialogOptions === "silent") ? true : undefined}>silent (DialogModes.NO)</SP.MenuItem>
									<SP.MenuItem key={"dontDisplay"} value={"dontDisplay"} selected={(dialogOptions === "dontDisplay") ? true : undefined}>dontDisplay (DialogModes.ERROR)</SP.MenuItem>
									<SP.MenuItem key={"display"} value={"display"} selected={(dialogOptions === "display") ? true : undefined}>display (DialogModes.ALL)</SP.MenuItem>
									<SP.MenuItem key={"default"} value={"default"} selected={(dialogOptions === null) ? true : undefined}>Default</SP.MenuItem>
								</SP.Menu>
							</SP.Dropdown>
						</div>
						<div className="column">
							<div className="label">modalBehavior</div>
							<SP.Dropdown quiet={false} className="fullW">
								<SP.Menu slot="options" onChange={this.onSetModalBehavior}>
									<SP.MenuItem key={"wait"} value={"wait"} selected={(modalBehavior === "wait") ? true : undefined}>wait</SP.MenuItem>
									<SP.MenuItem key={"execute"} value={"execute"} selected={(modalBehavior === "execute") ? true : undefined}>execute</SP.MenuItem>
									<SP.MenuItem key={"fail"} value={"fail"} selected={(modalBehavior === "fail") ? true : undefined}>fail</SP.MenuItem>
									<SP.MenuItem key={"default"} value={"default"} selected={(modalBehavior === null) ? true : undefined}>Default</SP.MenuItem>
								</SP.Menu>
							</SP.Dropdown>
						</div>
						<div className="row">
							<SP.Checkbox onChange={this.onSetSupportRawDataType} checked={!!supportRawDataType || undefined} indeterminate={supportRawDataType === "mixed" ? true : undefined}>Generate raw data type into source code. (might slow down panel when turned on)</SP.Checkbox>
						</div>
					</div>
				</Accordion>

				<Accordion id="codeSettings" expanded={accordionExpandedIDs} onChange={onToggleAccordion} header="Generated Code">
					<span className="scope">Global options for all items including already recorded</span>
					<div className="column indent">
						<div className="label">
							Indent using:
						</div>
						<SP.Dropdown quiet={false} className="fullW">
							<SP.Menu slot="options" onChange={this.onSetIndent} className="fullW">
								<SP.MenuItem key={"tab"} value={"tab"} selected={(indent === "tab") ? true : undefined}>1 tab</SP.MenuItem>

								<SP.MenuItem key={"space1"} value={"space1"} selected={(indent === "space1") ? true : undefined}>1 space</SP.MenuItem>
								<SP.MenuItem key={"space2"} value={"space2"} selected={(indent === "space2") ? true : undefined}>2 spaces</SP.MenuItem>
								<SP.MenuItem key={"space3"} value={"space3"} selected={(indent === "space3") ? true : undefined}>3 spaces</SP.MenuItem>
								<SP.MenuItem key={"space4"} value={"space4"} selected={(indent === "space4") ? true : undefined}>4 spaces</SP.MenuItem>
								<SP.MenuItem key={"space5"} value={"space5"} selected={(indent === "space5") ? true : undefined}>5 spaces</SP.MenuItem>
								<SP.MenuItem key={"space6"} value={"space6"} selected={(indent === "space6") ? true : undefined}>6 spaces</SP.MenuItem>
								<SP.MenuItem key={"space7"} value={"space7"} selected={(indent === "space7") ? true : undefined}>7 spaces</SP.MenuItem>
								<SP.MenuItem key={"space8"} value={"space8"} selected={(indent === "space8") ? true : undefined}>8 spaces</SP.MenuItem>
							</SP.Menu>
						</SP.Dropdown>
					</div>
					<div className="column">
						<div className="label">
							<span>Wrappers: </span><span>{ this.wrappersLabel}</span>
						</div>
						<SP.Slider
							variant="filled"
							min={0}
							max={3}
							onInput={this.onSetCodeWrappers}
							//onChange={(e: any) => onSetAutoExpandLevel(e.target.value)}
							value={this.wrappersValue}
						/>
					</div>
					<div className="row">
						<SP.Checkbox
							onChange={this.onSetImports}
							checked={codeImports==="require" || undefined}
						>{"Add require()"}</SP.Checkbox>
					</div>
					<div className="row">
						<SP.Checkbox
							onChange={(e) => onSetGlobalOptions({singleQuotes: !!e.target?.checked})}
							checked={singleQuotes || undefined}
						>Use single quotes</SP.Checkbox>
					</div>

					<div className="row">
						<SP.Checkbox
							onChange={(e) => onSetGlobalOptions({hide_isCommand: !!e.target?.checked})}
							checked={hide_isCommand || undefined}
						>Hide property &quot;_isCommand&quot;</SP.Checkbox>
					</div>
					<div className="row">
						<SP.Checkbox
							onChange={(e) => onSetGlobalOptions({hideDontRecord: !!e.target?.checked})}
							checked={hideDontRecord || undefined}
						>Hide property &quot;dontRecord&quot;</SP.Checkbox>
					</div>
					<div className="row">
						<SP.Checkbox
							onChange={(e) => onSetGlobalOptions({hideForceNotify: !!e.target?.checked})}
							checked={hideForceNotify || undefined}
						>Hide property &quot;forceNotify&quot;</SP.Checkbox>
					</div>
				</Accordion>

				<Accordion id="ui" expanded={accordionExpandedIDs} onChange={onToggleAccordion} header="UI">
					<div className="column">
						<span className="fontSizeLabel">
							Font size:
						</span>
						<SP.Dropdown className="fontSizeDropdown fullW" >
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
				</Accordion>

				<Accordion id="banList" expanded={accordionExpandedIDs} onChange={onToggleAccordion} header="Ignored Actions">
					<div className="column">
						<div>
							<span>
								Events that never will be recorded. No matter what you will set in include/exclude filter. One per line, no quotes, no commas or semicolons. Will Not affect already recorded items.
							</span>
						</div>
						<div>
							<SP.Textarea
								className="neverRecordActionNamesArea fullW"
								onInput={(e: any) => onNeverRecordActionNamesChanged(e.currentTarget.value)}
								value={neverRecordActionNames.join("\n")}
							/>
						</div>
					</div>
				</Accordion>

				<Accordion id="descriptorSettings" expanded={accordionExpandedIDs} onChange={onToggleAccordion} header="Descriptor Settings">
					<div className="row">
						<SP.Checkbox checked={ignoreRawData ? true : undefined} onChange={(e) => onSetRecordRaw(!!e.target?.checked)} >Record raw data type as an array of numbers to make it easily readable (might slow down Alchemist)</SP.Checkbox>
					</div>

					<div className="column">
						<label>Max. descriptors:</label>
						<SP.Textfield
							className="fullW"
							type="number"
							value={maximumItems.toString()}
							onChange={(e: any) => this.props.onSetMaximumItems(e.currentTarget.value)}
						/>
					</div>
				</Accordion>
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
	autoSelectedUUIDs: string[]
	globalSettings: ISettings
	descriptorSettings: IDescriptorSettings
	selected: IDescriptor[]
	settingsVisible: boolean
}

const mapStateToProps = (state: IRootState): ISettingsProps => ({	
	settings: getInspectorSettings(state),	
	autoSelectedUUIDs: getAutoSelectedUUIDs(state),
	descriptorSettings: getDescriptorOptions(state),
	globalSettings: getInspectorSettings(state),
	selected: getActiveDescriptors(state),
	settingsVisible: getSettingsVisible(state),
});

interface ISettingsDispatch {
	onSetRecordRaw: (value: boolean) => void
	onSetMaximumItems: (value: string) => void
	onSetFontSize: (value: TFontSizeSettings) => void
	onNeverRecordActionNamesChanged: (value: string) => void
	
	onSetGlobalOptions: (options: Partial<ISettings>) => void
	onSetDescriptorOptions: (uuids: string[] | "default", options: Partial<IDescriptorSettings>) => void
	setToggleSettings(): void
	
	onToggleAccordion(id:string,expanded:boolean):void
}

const mapDispatchToProps = (dispatch: Dispatch): ISettingsDispatch => ({
	onSetRecordRaw: (value) => dispatch(setRecordRawAction(value)),
	onSetMaximumItems: (value) => dispatch(setMaximumItems(value)),
	onSetFontSize: (value) => dispatch(setFontSizeAction(value)),
	onNeverRecordActionNamesChanged: (value) => dispatch(setNeverRecordActionNamesAction(value)),
	
	onSetGlobalOptions: (options) => dispatch(setSettingsAction(options)),
	onSetDescriptorOptions: (uuids, options) => dispatch(setDescriptorOptionsAction(uuids, options)),
	setToggleSettings: () => dispatch(toggleSettingsAction()),
	onToggleAccordion: (id, expanded) => dispatch(toggleAccordion(id, expanded)),
});

export const SettingsContainer = connect<ISettingsProps, ISettingsDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Settings);