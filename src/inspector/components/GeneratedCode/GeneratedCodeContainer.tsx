import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";
import { getActiveDescriptorCalculatedReference, getCodeActiveView, getDescriptorOptions } from "../../selectors/inspectorCodeSelectors";
import { getActiveDescriptors, getAutoSelectedUUIDs } from "../../selectors/inspectorSelectors";
import { setDescriptorOptionsAction, setInspectorViewAction } from "../../actions/inspectorActions";

import React, { Component } from "react";
import { IDescriptor, IDescriptorSettings, TCodeViewType } from "../../model/types";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./GeneratedCode.less";
import { Dispatch } from "redux";

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
		const { autoSelectedUUIDs, selected, onSetOptions } = this.props;
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


	
	public render(): React.ReactNode {

		const { dialogOptions, modalBehavior, synchronousExecution,supportRawDataType } = this.props.descriptorSettings;
		return (
			<div className="GeneratedCode">
				<TabList className="tabsView" activeKey={this.props.viewType} onChange={this.props.onSetView}>
					<TabPanel id="generated" title="Generated" >
						<div className="info code">
							<div className="noShrink">
								Generated code:
								<div className="textareaWrap">
									<span className="placeholder">{this.props.originalReference}</span>
									<textarea
										maxLength={Number.MAX_SAFE_INTEGER}
										className="infoBlock"
										defaultValue={
											this.props.originalReference
										}
									/>
								</div>
							</div>
						</div>
					</TabPanel>
					<TabPanel id="options" title="Options" >
						<div><span className="title">Batch play options</span></div>
						<div><span className="scope">{this.renderOptionsScope()}</span></div>
						<div className="row">
							<div className="label">synchronousExecution</div>
							<sp-dropdown quiet={true}>
								<sp-menu slot="options" onClick={this.onSynchronousExecution}>
									<sp-menu-item key={"true"} value={"true"} selected={(synchronousExecution === true) ? true : null}>true</sp-menu-item>
									<sp-menu-item key={"false"} value={"false"} selected={(synchronousExecution === false) ? true : null}>false</sp-menu-item>
									<sp-menu-item key={"default"} value={"default"} selected={(synchronousExecution === null) ? true : null}>Default</sp-menu-item>
								</sp-menu>
							</sp-dropdown>
						</div>
						<div className="row">
							<div className="label">dialogOptions</div>
							<sp-dropdown quiet={true}>
								<sp-menu slot="options" onClick={this.onSetDialogOptions}>
									<sp-menu-item key={"silent"} value={"silent"} selected={(dialogOptions === "silent") ? true : null}>silent (DialogModes.NO)</sp-menu-item>
									<sp-menu-item key={"dontDisplay"} value={"dontDisplay"} selected={(dialogOptions === "dontDisplay") ? true : null}>dontDisplay (DialogModes.ERROR)</sp-menu-item>
									<sp-menu-item key={"display"} value={"display"} selected={(dialogOptions === "display") ? true : null}>display (DialogModes.ALL)</sp-menu-item>
									<sp-menu-item key={"default"} value={"default"} selected={(dialogOptions === null) ? true : null}>Default</sp-menu-item>
								</sp-menu>
							</sp-dropdown>
						</div>
						<div className="row">
							<div className="label">modalBehavior</div>
							<sp-dropdown quiet={false}>
								<sp-menu slot="options" onClick={this.onSetModalBehavior}>
									<sp-menu-item key={"wait"} value={"wait"} selected={(modalBehavior === "wait") ? true : null}>wait</sp-menu-item>
									<sp-menu-item key={"execute"} value={"execute"} selected={(modalBehavior === "execute") ? true : null}>execute</sp-menu-item>
									<sp-menu-item key={"fail"} value={"fail"} selected={(modalBehavior === "fail") ? true : null}>fail</sp-menu-item>
									<sp-menu-item key={"default"} value={"default"} selected={(modalBehavior === null) ? true : null}>Default</sp-menu-item>
								</sp-menu>
							</sp-dropdown>
						</div>
						<div className="row">
							<sp-checkbox onClick={this.onSetSupportRawDataType} checked={supportRawDataType === true ? true : undefined} indeterminate={supportRawDataType === "mixed" ? true : undefined}>Support raw data type</sp-checkbox>
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
}

const mapStateToProps = (state: IRootState): IGeneratedCodeProps => ({
	originalReference: getActiveDescriptorCalculatedReference(state),
	selected: getActiveDescriptors(state),
	autoSelectedUUIDs: getAutoSelectedUUIDs(state),
	descriptorSettings: getDescriptorOptions(state),
	viewType: getCodeActiveView(state),
});

interface IGeneratedCodeDispatch {
	onSetOptions: (uuids: string[] | "default", options: Partial<IDescriptorSettings>) => void
	onSetView: (viewType: TCodeViewType) => void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IGeneratedCodeDispatch, Record<string, unknown>> = (dispatch:Dispatch):IGeneratedCodeDispatch => ({
	onSetOptions: (uuids, options) => dispatch(setDescriptorOptionsAction(uuids, options)),
	onSetView:(viewType) => dispatch(setInspectorViewAction("code",viewType)),
});

export const GeneratedCodeContainer = connect<IGeneratedCodeProps, IGeneratedCodeDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(GeneratedCode);