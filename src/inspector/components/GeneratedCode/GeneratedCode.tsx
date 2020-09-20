import { CommandOptions } from "photoshop/dist/types/UXP";
import React, { Component } from "react";
import { IDescriptor, IDescriptorSettings, TCodeViewType } from "../../model/types";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./GeneratedCode.less";

export interface IGeneratedCodeProps{
	originalReference: string
	autoSelectedUUIDs: string[]
	selected: IDescriptor[]
	descriptorSettings: IDescriptorSettings
	viewType: TCodeViewType
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IGeneratedCodeDispatch {
	onSetOptions: (uuids: string[] | "default", options: CommandOptions) => void
	onSetView: (viewType: TCodeViewType) => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IGeneratedCodeState{
}

export type TGeneratedCode = IGeneratedCodeProps & IGeneratedCodeDispatch

export class GeneratedCode extends Component<TGeneratedCode, IGeneratedCodeState> {

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

	private common = (options: CommandOptions) => {
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
	
	public render(): React.ReactNode {

		const { dialogOptions, modalBehavior, synchronousExecution } = this.props.descriptorSettings;
		return (
			<div className="GeneratedCode">
				<TabList className="tabsView" activeKey={this.props.viewType} onChange={this.props.onSetView}>
					<TabPanel id="generated" title="Generated" >
						<div className="info code">
							<div className="noShrink">
								Generated code:
								<textarea
									maxLength={Number.MAX_SAFE_INTEGER}
									className="infoBlock"
									defaultValue={
										this.props.originalReference
									}
								/>
							</div>
						</div>
					</TabPanel>
					<TabPanel id="options" title="Options" >
						<div><span className="title">Batch play options</span></div>
						<div><span className="scope">{this.renderOptionsScope()}</span></div>
						<div className="row">
							<div className="label">synchronousExecution</div>
							<sp-dropdown quiet="true">
								<sp-menu slot="options" onClick={this.onSynchronousExecution}>
									<sp-menu-item key={"true"} value={"true"} selected={(synchronousExecution === true) ? "selected" : null}>true</sp-menu-item>
									<sp-menu-item key={"false"} value={"false"} selected={(synchronousExecution === false) ? "selected" : null}>false</sp-menu-item>
									<sp-menu-item key={"default"} value={"default"} selected={(synchronousExecution === null) ? "selected" : null}>Default</sp-menu-item>
								</sp-menu>
							</sp-dropdown>
						</div>
						<div className="row">
							<div className="label">dialogOptions</div>
							<sp-dropdown quiet="true">
								<sp-menu slot="options" onClick={this.onSetDialogOptions}>
									<sp-menu-item key={"silent"} value={"silent"} selected={(dialogOptions === "silent") ? "selected" : null}>silent</sp-menu-item>
									<sp-menu-item key={"dontDisplay"} value={"dontDisplay"} selected={(dialogOptions === "dontDisplay") ? "selected" : null}>dontDisplay</sp-menu-item>
									<sp-menu-item key={"display"} value={"display"} selected={(dialogOptions === "display") ? "selected" : null}>display</sp-menu-item>
									<sp-menu-item key={"default"} value={"default"} selected={(dialogOptions === null) ? "selected" : null}>Default</sp-menu-item>
								</sp-menu>
							</sp-dropdown>
						</div>
						<div className="row">
							<div className="label">modalBehavior</div>
							<sp-dropdown quiet="false">
								<sp-menu slot="options" onClick={this.onSetModalBehavior}>
									<sp-menu-item key={"wait"} value={"wait"} selected={(modalBehavior === "wait") ? "selected" : null}>wait</sp-menu-item>
									<sp-menu-item key={"execute"} value={"execute"} selected={(modalBehavior === "execute") ? "selected" : null}>execute</sp-menu-item>
									<sp-menu-item key={"fail"} value={"fail"} selected={(modalBehavior === "fail") ? "selected" : null}>fail</sp-menu-item>
									<sp-menu-item key={"default"} value={"default"} selected={(modalBehavior === null) ? "selected" : null}>Default</sp-menu-item>
								</sp-menu>
							</sp-dropdown>
						</div>
					</TabPanel>
				</TabList>
			</div>
		);
	}
}