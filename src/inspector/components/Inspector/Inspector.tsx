import React from "react";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./../../../shared/ThemeVars.css";
import "./Inspector.less";
import { LeftColumnContainer } from "../LeftColumn/LeftColumnContainer";
import { TActiveSection, TActiveInspectorTab } from "../../model/types";
import { FooterContainer } from "../Footer/FooterContainer";
import { TreeContentContainer } from "../TreeContent/TreeContentContainer";
import Split from "react-split";
import { TreeDiffContainer } from "../TreeDiff/TreeDiffContainer";
import { TreeDomContainer } from "../TreeDom/TreeDomContainer";
import { DispatcherContainer } from "../Dispatcher/DispatcherContainer";
import { GeneratedCodeContainer } from "../GeneratedCode/GeneratedCodeContainer";


export interface IInspectorProps{
	mainTab: TActiveSection
	modeTab: TActiveInspectorTab	
	calculatedReference: string
}

export interface IInspectorDispatch {
	setMainTab(name: TActiveSection): void
	setModeTab(mode: TActiveInspectorTab): void
	setWholeState():void
}


type TInspector = IInspectorProps & IInspectorDispatch

interface IState{
}

export class Inspector extends React.Component<TInspector, IState> { 
	constructor(props: TInspector) {
		super(props);

		this.props.setWholeState();
		this.state = {
		};
	}

	public render(): JSX.Element {
		return (
			<div className="Inspector">
				<TabList className="tabsRoot" activeKey={this.props.mainTab} onChange={this.props.setMainTab}>
					<TabPanel noPadding={true} id="descriptors" title="Descriptors" >
						<div className="descriptorsColumns">
							<Split
								sizes={[30, 70]}
								gutterSize={3}
							>
								<LeftColumnContainer />
								<TabList className="tabsDescriptor" activeKey={this.props.modeTab} onChange={this.props.setModeTab}>
									<TabPanel id="content" title="Content" >
										<TreeContentContainer />
									</TabPanel>
									<TabPanel id="difference" title="Difference" >
										<TreeDiffContainer />
									</TabPanel>
									<TabPanel id="dom" title="DOM (live)" >
										<TreeDomContainer />
									</TabPanel>
									<TabPanel id="reference" title="Code" >
										<GeneratedCodeContainer />
									</TabPanel>
									<TabPanel id="info" title="Used filter" >
										<div className="info code">
											<div className="noShrink">
												Filter:
												<textarea
													maxLength={Number.MAX_SAFE_INTEGER}
													className="infoBlock"
													defaultValue={
														this.props.calculatedReference
													}
												/>
											</div>
										</div>
									</TabPanel>
								</TabList>
							</Split>
						</div>
					</TabPanel>
					<TabPanel id="dispatcher" title="Dispatch">
						<DispatcherContainer />
					</TabPanel>
					<TabPanel id="settings" title="Settings">
						<div><span className="title">Descriptor settings: </span></div>
						<div className="row">
							<div className="label">Raw data type format</div>
							<sp-dropdown quiet="false" disabled={"true"}>
								<sp-menu slot="options" onClick={(e: string) => { console.log(e); }}>
									<sp-menu-item key={"ignore"} value={"ignore"} selected={false}>Ignore (placeholder)</sp-menu-item>
									<sp-menu-item key={"readability"} value={"readability"} selected={false}>Readability (array)</sp-menu-item>
									<sp-menu-item key={"executability"} value={"executability"} selected={false}>Executability (base64)</sp-menu-item>
								</sp-menu>
							</sp-dropdown>
						</div>
					</TabPanel>
				</TabList>
				<FooterContainer />
			</div>
		);
	}
}