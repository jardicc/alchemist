import { connect, MapDispatchToPropsFunction } from "react-redux";
import { setMainTabAction, setModeTabAction, replaceWholeStateAction, setColumnSizeAction } from "../../actions/inspectorActions";
import { IRootState } from "../../../shared/store";
import { Settings } from "../../classes/Settings";
import { getMainTabID, getModeTabID, getActiveDescriptorOriginalReference, getFontSizeSettings, getLeftColumnWidth } from "../../selectors/inspectorSelectors";

import React from "react";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./../../../shared/ThemeVars.css";
import "./Inspector.less";
import { TActiveSection, TActiveInspectorTab, TFontSizeSettings } from "../../model/types";
import { FooterContainer } from "../Footer/FooterContainer";
import { TreeContentContainer } from "../TreeContent/TreeContentContainer";
import { TreeDiffContainer } from "../TreeDiff/TreeDiffContainer";
import { TreeDomContainer } from "../TreeDom/TreeDomContainer";
import { DispatcherContainer } from "../Dispatcher/DispatcherContainer";
import { GeneratedCodeContainer } from "../GeneratedCode/GeneratedCodeContainer";
import { SettingsContainer } from "../Settings/SettingsContainer";
import { IconX} from "../../../shared/components/icons";
import { LeftColumnContainer } from "../LeftColumn/LeftColumn";
import {Pane} from "react-split-pane";
import SplitPane from "react-split-pane";
import { default as SP } from "react-uxp-spectrum";
import {FiltersContainer} from "../Filters/Filters";


class Inspector extends React.Component<TInspector, IInspectorState> { 
	constructor(props: TInspector) {
		super(props);

		this.props.setWholeState();
		this.state = {
			showMessage: false,
			message: "",
			link:"",
		};
	}

	private closeMessage = () => {
		this.setState({
			...this.state,
			showMessage: false,
		});
	}

	public componentDidMount():void {		
		(async () => {
			const res = await fetch("http://alchemist.bereza.cz/alchemist-message.json");
			if (res.status !== 200) {
				return;
			}
			const data = await res.json();
			this.setState({
				...this.state,
				message: data.message,
				link: data.link,
				showMessage:true,
			});
			console.log("fetch",data);			
		})();
	}

	public render(): JSX.Element {
		const { fontSizeSettings,leftColumnWidthPx,setColumnSize} = this.props;
		return (
			<div className={`Inspector ${fontSizeSettings}`} key={fontSizeSettings}>
				<div className="descriptorsColumns">
					<SplitPane className="split" split="vertical" defaultSize={leftColumnWidthPx} onDragFinished={setColumnSize}>
						<Pane className="leftPane">
							<LeftColumnContainer />

						</Pane>
						<Pane className="rightPane">
							<TabList className="tabsDescriptor" activeKey={this.props.modeTab} onChange={this.props.setModeTab}>
								<TabPanel id="content" title="Content" noPadding={true}>
									<TreeContentContainer />
								</TabPanel>
								<TabPanel id="difference" title="Difference" noPadding={true}>
									<TreeDiffContainer />
								</TabPanel>
								<TabPanel id="dom" title="DOM (live)" noPadding={true} >
									<TreeDomContainer />
								</TabPanel>
								<TabPanel id="reference" title="Code" marginRight={true}>
									<GeneratedCodeContainer />
								</TabPanel>
								<TabPanel id="dispatcher" title="Dispatch">
									<DispatcherContainer />
								</TabPanel>
								<TabPanel id="settings" title="Settings">
									<SettingsContainer />
								</TabPanel>
							</TabList>
						</Pane>
					</SplitPane>
				</div>
				<FooterContainer parentPanel="inspector" />
				{this.state.showMessage && <div className="messageStrip"><a href={this.state.link} className="link">{this.state.message}</a><span className="close" onClick={this.closeMessage}><IconX /></span></div>}
			</div>
		);
	}
}

type TInspector = IInspectorProps & IInspectorDispatch

interface IInspectorState{
	showMessage: boolean
	message: string
	link:string
}

interface IInspectorProps{
	mainTab: TActiveSection
	modeTab: TActiveInspectorTab	
	calculatedReference: string
	leftColumnWidthPx: number
	fontSizeSettings:TFontSizeSettings
}

const mapStateToProps = (state: any): IInspectorProps => (state = state as IRootState,{
	mainTab: getMainTabID(state),
	modeTab: getModeTabID(state),
	calculatedReference: getActiveDescriptorOriginalReference(state),
	leftColumnWidthPx: getLeftColumnWidth(state),
	fontSizeSettings: getFontSizeSettings(state),
});

interface IInspectorDispatch {
	setMainTab(name:TActiveSection): void
	setModeTab(mode: TActiveInspectorTab): void
	setWholeState(): void
	setColumnSize(px:number):void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IInspectorDispatch, Record<string, unknown>> = (dispatch):IInspectorDispatch => ({
	setMainTab: (key) => dispatch(setMainTabAction(key)),
	setModeTab: (key) => dispatch(setModeTabAction(key)),
	setWholeState: async () => {
		dispatch(replaceWholeStateAction(await Settings.importState()));
		Settings.loaded = true;
	},
	setColumnSize:(px)=>dispatch(setColumnSizeAction(px)),
});

export const InspectorContainer = connect<IInspectorProps, IInspectorDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Inspector);