import React from "react";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./../../../shared/ThemeVars.css";
import "./Inspector.less";
import { LeftColumnContainer } from "../LeftColumn/LeftColumnContainer";
import { TActiveSection, TActiveInspectorTab, IDescriptor } from "../../model/types";
import { FooterContainer } from "../Footer/FooterContainer";
import { VisualDiffTab } from "../VisualDiff/VisualDiff";
import { TreeDiff } from "../TreeDiff/TreeDiff";
import { TreeDiffContainer } from "../TreeDiff/TreeDiffContainer";

export interface IInspectorProps{
	mainTab: TActiveSection
	modeTab: TActiveInspectorTab	
	descriptorContent: string
	calculatedReference: string
	originalReference: string
	selectedDescriptors: IDescriptor[]
}

export interface IInspectorDispatch {
	setMainTab(name: TActiveSection): void
	setModeTab(mode:TActiveInspectorTab):void
}


type TInspector = IInspectorProps & IInspectorDispatch

interface IState{
	diffSubtab: "Tree"|"Raw"
}

export class Inspector extends React.Component<TInspector, IState> { 
	constructor(props: TInspector) {
		super(props);

		this.state = {
			diffSubtab: "Tree"
		};
	}

	private setDiffSubtab = (key:"Tree"|"Raw") => {
		this.setState({
			...this.state,
			diffSubtab: key
		});
	}

	public render(): JSX.Element {

		return (
			<div className="Inspector">
				<TabList className="tabsRoot" activeKey={this.props.mainTab} onChange={this.props.setMainTab}>
					<TabPanel id="descriptors" title="Descriptors" >
						<div className="descriptorsColumns">
							<LeftColumnContainer />
							<TabList  className="tabsDescriptor" activeKey={this.props.modeTab} onChange={this.props.setModeTab}>
								<TabPanel id="content" title="Content" >
									<div className="code">
										{this.props.descriptorContent}
									</div>
								</TabPanel>
								<TabPanel id="difference" title="Difference" >
									<TabList className="tabsView" activeKey={this.state.diffSubtab} onChange={this.setDiffSubtab}>
										<TabPanel id="Tree" title="Tree" >
											<div className="diff">
												<TreeDiffContainer/>
											</div>
										</TabPanel>
										<TabPanel id="Raw" title="Raw" >
											<div className="diff">
												<VisualDiffTab
													left={this.props.selectedDescriptors[0]?.originalData}
													right={this.props.selectedDescriptors[1]?.originalData}
												/>
											</div>
										</TabPanel>
									</TabList>
								</TabPanel>
								<TabPanel id="reference" title="Info" >
									<div className="info code">
										<div className="noShrink">
											Filter:
											{this.props.calculatedReference}
											<br />
											Reference:
											{this.props.originalReference}
										</div>
									</div>
								</TabPanel>
							</TabList>
						</div>
					</TabPanel>
					<TabPanel id="settings" title="Settings">
						settings
					</TabPanel>
				</TabList>
				<FooterContainer />
			</div>
		);
	}
}