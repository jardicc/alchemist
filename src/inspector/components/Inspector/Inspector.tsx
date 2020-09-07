import React from "react";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./../../../shared/ThemeVars.css";
import "./Inspector.less";
import { LeftColumnContainer } from "../LeftColumn/LeftColumnContainer";
import { TActiveSection, TActiveInspectorTab, IDescriptor } from "../../model/types";
import { FooterContainer } from "../Footer/FooterContainer";
import { VisualDiffTab } from "../VisualDiff/VisualDiff";
import { TreeContentContainer } from "../TreeContent/TreeContentContainer";
import Split from "react-split";
import { TreeDiffContainer } from "../TreeDiff/TreeDiffContainer";
import { TreeDomContainer } from "../TreeDom/TreeDomContainer";


export interface IInspectorProps{
	mainTab: TActiveSection
	modeTab: TActiveInspectorTab	
	descriptorContent: string
	calculatedReference: string
	originalReference: string
	leftRawDiff:IDescriptor | null
	rightRawDiff:IDescriptor | null
}

export interface IInspectorDispatch {
	setMainTab(name: TActiveSection): void
	setModeTab(mode: TActiveInspectorTab): void
	setWholeState():void
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

	public componentDidMount(): void {
		this.props.setWholeState();
	}

	public render(): JSX.Element {
		return (
			<div className="Inspector">
				<TabList className="tabsRoot" activeKey={this.props.mainTab} onChange={this.props.setMainTab}>
					<TabPanel id="descriptors" title="Descriptors" >
						<div className="descriptorsColumns">
							<Split
								sizes={[30, 70]}
								gutterSize={3}
							>
								<LeftColumnContainer />
								<TabList className="tabsDescriptor" activeKey={this.props.modeTab} onChange={this.props.setModeTab}>
									<TabPanel id="content" title="Content" >
										<TabList className="tabsView" activeKey={this.state.diffSubtab} onChange={this.setDiffSubtab}>
											<TabPanel id="Tree" title="Tree" >
												<TreeContentContainer />
											</TabPanel>
											<TabPanel id="Raw" title="Raw" >
												<textarea
													className="rawCode"
													defaultValue={this.props.descriptorContent}
												/>
											</TabPanel>
										</TabList>
									</TabPanel>
									<TabPanel id="difference" title="Difference" >
										<TabList className="tabsView" activeKey={this.state.diffSubtab} onChange={this.setDiffSubtab}>
											<TabPanel id="Tree" title="Tree" >
												<TreeDiffContainer />
											</TabPanel>
											<TabPanel id="Raw" title="Raw" >
												<VisualDiffTab
													left={this.props.leftRawDiff}
													right={this.props.rightRawDiff}
												/>
											</TabPanel>
										</TabList>
									</TabPanel>
									<TabPanel id="dom" title="DOM (live)" >
										<TreeDomContainer />
									</TabPanel>
									<TabPanel id="reference" title="Code" >
										<div className="info code">
											<div className="noShrink">
												Generated code:
												<textarea
													className="infoBlock"
													defaultValue={
														this.props.originalReference
													}
												/>
											</div>
										</div>
									</TabPanel>
									<TabPanel id="info" title="Used filter" >
										<div className="info code">
											<div className="noShrink">
												Filter:
												<textarea
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
					<TabPanel id="settings" title="Settings">
						TODO
					</TabPanel>
				</TabList>
				<FooterContainer />
			</div>
		);
	}
}