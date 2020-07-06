import React from "react";
import { TabList } from "./TabList";
import { TabPanel } from "./TabPanel";
import { TActiveSection, TActiveInspectorTab } from "../reducers/initialStateInspector";
import "./Inspector.css";
import { LeftColumnContainer } from "./LeftColumnContainer";

export interface IInspectorProps{
	mainTab: TActiveSection
	modeTab: TActiveInspectorTab	
	descriptorContent: string
	originalReference: string
}

export interface IInspectorDispatch {
	setMainTab(name: TActiveSection): void
	setModeTab(mode:TActiveInspectorTab):void
}

interface IInspectorState{
	
}

type TInspector = IInspectorProps & IInspectorDispatch

export class Inspector extends React.Component<TInspector, IInspectorState> { 
	constructor(props: TInspector) {
		super(props);

		this.state = {
		};
	}

	public render():JSX.Element {
		return (
			<div className="Inspector">
				<TabList activeKey={this.props.mainTab} onChange={this.props.setMainTab}>
					<TabPanel id="descriptors" title="Descriptors" >
						<div className="descriptorsColumns">
							<LeftColumnContainer />
							<TabList activeKey={this.props.modeTab} onChange={this.props.setModeTab}>
								<TabPanel id="content" title="Content" >
									<div className="code">
										{this.props.descriptorContent}
									</div>
								</TabPanel>
								<TabPanel id="difference" title="Difference" >
									Difference
								</TabPanel>
								<TabPanel id="reference" title="Info" >
									<div className="info code">
										{this.props.originalReference}
									</div>
								</TabPanel>
							</TabList>
						</div>
					</TabPanel>
					<TabPanel id="settings" title="Settings">
						settings
					</TabPanel>
				</TabList>
				<div className="footer">
					footer
				</div>
			</div>
		);
	}
}