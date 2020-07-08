import React from "react";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./Inspector.css";
import { LeftColumnContainer } from "../LeftColumn/LeftColumnContainer";
import { TActiveSection, TActiveInspectorTab } from "../../model/types";

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


type TInspector = IInspectorProps & IInspectorDispatch

export class Inspector extends React.Component<TInspector> { 
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
					<div className="button">Clear</div>
					<div className="button">Clear view</div>
					<div className="button">Clear non-existent</div>
					<div className="spread"></div>
					<div className="button">Import</div>
					<div className="button">Export</div>
				</div>
			</div>
		);
	}
}