import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import { getActiveDescriptorCalculatedReference, getCodeActiveView, getDescriptorOptions } from "../../selectors/inspectorCodeSelectors";
import { getActiveDescriptors, getAutoSelectedUUIDs, getInspectorSettings } from "../../selectors/inspectorSelectors";
import { setDescriptorOptionsAction, setInspectorViewAction, setSettingsAction } from "../../actions/inspectorActions";

import React, { Component } from "react";
import { IDescriptor, IDescriptorSettings, ISettings, TCodeViewType } from "../../model/types";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./GeneratedCode.less";
import { Dispatch } from "redux";
import SP from "react-uxp-spectrum";

class GeneratedCode extends Component<TGeneratedCode, Record<string,unknown>> {

	constructor(props: TGeneratedCode) {
		super(props);

		this.state = {
		};
	}

	private renderOptionsScope = ():React.ReactNode => {
		const auto = this.props.autoSelectedUUIDs;

		if (auto?.length) {
			return (
				<>Will affect all new items</>
			);
		} else {
			return (<>Will change {this.props.selected?.length ?? 0} selected item(s)</>);
		}
	}

	private common = (options: Partial<IDescriptorSettings>) => {
		const { autoSelectedUUIDs, selected, onSetDescriptorOptions: onSetOptions } = this.props;
		if (autoSelectedUUIDs?.length) {
			onSetOptions("default", options);			
		} else {
			onSetOptions(selected.map(item => item.id), options);
		}
	}

	private onSynchronousExecution = (e: any) => {
		let value = e.currentTarget.value;
		if (value === "default") {
			value = null;
		} else {
			value = value === "true";
		}
		this.common({ synchronousExecution: value});
	}

	private onSetDialogOptions = (e: any) => {
		const value = e.currentTarget.value;
		this.common({ dialogOptions: (value === "default" ? null : value) });
	}

	private onSetModalBehavior = (e: any) => {
		const value = e.currentTarget.value;
		this.common({ modalBehavior: (value === "default" ? null : value) });
	}
	
	private onSetSupportRawDataType = (e: any) => {
		const value = e.target.checked;
		this.common({ supportRawDataType: !!value });
	}

	private onSetIndent = (e: any) => {
		const value = e.currentTarget.value;
		this.props.onSetGlobalOptions({ indent:  value });
	}
	
	public render(): React.ReactNode {

		const { onSetGlobalOptions} = this.props;
		const { dialogOptions, modalBehavior, synchronousExecution,supportRawDataType } = this.props.descriptorSettings;
		const {indent,singleQuotes,hideDontRecord,hideForceNotify,hide_isCommand } = this.props.globalSettings;
		return (
			<div className="GeneratedCode">
				<TabList className="tabsView" activeKey={this.props.viewType} onChange={this.props.onSetView}>
					<TabPanel id="generated" title="Generated" >
						<div className="info code">
							<div className="noShrink">
								<div className="textareaWrap">
									<SP.Textarea
										className="infoBlock"
										value={
											this.props.originalReference
										}
									/>
								</div>
							</div>
						</div>
					</TabPanel>
					<TabPanel id="options" title="Options" >
						<h3>Batch play options</h3>
						<span className="scope">{this.renderOptionsScope()}</span>
						<div className="row">
							<div className="label">synchronousExecution</div>
							<SP.Dropdown quiet={false}>
								<SP.Menu slot="options" onChange={this.onSynchronousExecution}>
									<SP.MenuItem key={"true"} value={"true"} selected={(synchronousExecution === true) ? true : undefined}>true</SP.MenuItem>
									<SP.MenuItem key={"false"} value={"false"} selected={(synchronousExecution === false) ? true : undefined}>false</SP.MenuItem>
									<SP.MenuItem key={"default"} value={"default"} selected={(synchronousExecution === null) ? true : undefined}>Default</SP.MenuItem>
								</SP.Menu>
							</SP.Dropdown>
						</div>
						<div className="row">
							<div className="label">dialogOptions</div>
							<SP.Dropdown quiet={false}>
								<SP.Menu slot="options" onChange={this.onSetDialogOptions}>
									<SP.MenuItem key={"silent"} value={"silent"} selected={(dialogOptions === "silent") ? true : undefined}>silent (DialogModes.NO)</SP.MenuItem>
									<SP.MenuItem key={"dontDisplay"} value={"dontDisplay"} selected={(dialogOptions === "dontDisplay") ? true : undefined}>dontDisplay (DialogModes.ERROR)</SP.MenuItem>
									<SP.MenuItem key={"display"} value={"display"} selected={(dialogOptions === "display") ? true : undefined}>display (DialogModes.ALL)</SP.MenuItem>
									<SP.MenuItem key={"default"} value={"default"} selected={(dialogOptions === null) ? true : undefined}>Default</SP.MenuItem>
								</SP.Menu>
							</SP.Dropdown>
						</div>
						<div className="row">
							<div className="label">modalBehavior</div>
							<SP.Dropdown quiet={false}>
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
						<SP.Divider />
						<h3>Generated code options</h3>
						<span className="scope">Global options for all items including already recorded</span>
						<div className="row">
							<div className="label">
								Indent using:
							</div>
							<SP.Dropdown quiet={false}>
								<SP.Menu slot="options" onChange={this.onSetIndent}>
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

					</TabPanel>
				</TabList>
			</div>
		);
	}
}


type TGeneratedCode = IGeneratedCodeProps & IGeneratedCodeDispatch

interface IGeneratedCodeProps{
	originalReference: string
	autoSelectedUUIDs: string[]
	selected: IDescriptor[]
	descriptorSettings: IDescriptorSettings
	viewType: TCodeViewType
	globalSettings:ISettings
}

const mapStateToProps = (state: IRootState): IGeneratedCodeProps => ({
	originalReference: getActiveDescriptorCalculatedReference(state),
	selected: getActiveDescriptors(state),
	autoSelectedUUIDs: getAutoSelectedUUIDs(state),
	descriptorSettings: getDescriptorOptions(state),
	globalSettings:getInspectorSettings(state),
	viewType: getCodeActiveView(state),
});

interface IGeneratedCodeDispatch {
	onSetGlobalOptions:(options: Partial<ISettings>)=>void
	onSetDescriptorOptions: (uuids: string[] | "default", options: Partial<IDescriptorSettings>) => void
	onSetView: (viewType: TCodeViewType) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IGeneratedCodeDispatch, Record<string, unknown>> = (dispatch: Dispatch): IGeneratedCodeDispatch => ({
	onSetGlobalOptions: (options)=>dispatch(setSettingsAction(options)),
	onSetDescriptorOptions: (uuids, options) => dispatch(setDescriptorOptionsAction(uuids, options)),
	onSetView:(viewType) => dispatch(setInspectorViewAction("code",viewType)),
});

export const GeneratedCodeContainer = connect<IGeneratedCodeProps, IGeneratedCodeDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(GeneratedCode);