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
import { Helpers } from "../../classes/Helpers";
import { SettingsContainer } from "../Settings/SettingsContainer";


export interface IInspectorProps{
	mainTab: TActiveSection
	modeTab: TActiveInspectorTab	
	calculatedReference: string
	columnSizesPercentage: [number,number]
}

export interface IInspectorDispatch {
	setMainTab(name: TActiveSection): void
	setModeTab(mode: TActiveInspectorTab): void
	setWholeState(): void
	setColumnSize(px:number):void
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

	/*private static _loaded = false;

	public static get loaded(): boolean{
		return this._loaded;
	}*/

	/*public componentDidMount():void {
		Inspector._loaded = true;
	}*/


	/*private onSplitChange = (sizes: [number, number]) => {
		if (sizes?.length === 2) {
			this.props.setColumnSize(Helpers.percToPanelWidthPx("inspector",sizes[0]));
		}
	}*/

	public render(): JSX.Element {
		const { columnSizesPercentage } = this.props;
		return (
			<div className="Inspector">
				<TabList className="tabsRoot" activeKey={this.props.mainTab} onChange={this.props.setMainTab}>
					<TabPanel noPadding={true} id="descriptors" title="Descriptors" >
						<div className="descriptorsColumns">
							<Split
								sizes={/*Inspector.loaded ? columnSizesPercentage:*/[30,70] }
								gutterSize={3}
								//onDragEnd={this.onSplitChange as any}
								//onDrag={(e)=>console.log(e)}
							>
								<LeftColumnContainer />
								<TabList className="tabsDescriptor" activeKey={this.props.modeTab} onChange={this.props.setModeTab}>
									<TabPanel id="content" title="Content" noPadding={true}>
										<TreeContentContainer />
									</TabPanel>
									<TabPanel id="difference" title="Difference"  noPadding={true}>
										<TreeDiffContainer />
									</TabPanel>
									<TabPanel id="dom" title="DOM (live)" noPadding={true} >
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
						<SettingsContainer />
					</TabPanel>
				</TabList>
				<FooterContainer />
			</div>
		);
	}
}