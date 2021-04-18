import { connect, MapDispatchToPropsFunction } from "react-redux";
import { setMainTabAction, setModeTabAction, replaceWholeStateAction, setColumnSizeAction } from "../../actions/inspectorActions";
import { IRootState } from "../../../shared/store";
import { Settings } from "../../classes/Settings";
import { getMainTabID, getModeTabID, getActiveDescriptorOriginalReference, getFontSizeSettings } from "../../selectors/inspectorSelectors";

import React from "react";
import { TabList } from "../Tabs/TabList";
import { TabPanel } from "../Tabs/TabPanel";
import "./../../../shared/ThemeVars.css";
import "./Inspector.less";
import { LeftColumnContainer } from "../LeftColumn/LeftColumnContainer";
import { TActiveSection, TActiveInspectorTab, TFontSizeSettings } from "../../model/types";
import { FooterContainer } from "../Footer/FooterContainer";
import { TreeContentContainer } from "../TreeContent/TreeContentContainer";
import Split from "react-split";
import { TreeDiffContainer } from "../TreeDiff/TreeDiffContainer";
import { TreeDomContainer } from "../TreeDom/TreeDomContainer";
import { DispatcherContainer } from "../Dispatcher/DispatcherContainer";
import { GeneratedCodeContainer } from "../GeneratedCode/GeneratedCodeContainer";
import { SettingsContainer } from "../Settings/SettingsContainer";
import { AMConverterContainer } from "../AMConverter/AMConverter";
import { IconX} from "../../../shared/components/icons";


export interface IInspectorProps{
	mainTab: TActiveSection
	modeTab: TActiveInspectorTab	
	calculatedReference: string
	columnSizesPercentage: [number, number]
	fontSizeSettings:TFontSizeSettings
}

export interface IInspectorDispatch {
	setMainTab(name: TActiveSection): void
	setModeTab(mode: TActiveInspectorTab): void
	setWholeState(): void
	setColumnSize(px:number):void
}


type TInspector = IInspectorProps & IInspectorDispatch

interface IState{
	showMessage: boolean
	message: string
	link:string
}

class Inspector extends React.Component<TInspector, IState> { 
	constructor(props: TInspector) {
		super(props);

		this.props.setWholeState();
		this.state = {
			showMessage: false,
			message: "",
			link:""
		};
	}

	private closeMessage = () => {
		this.setState({
			...this.state,
			showMessage: false
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
				showMessage:true
			});
			console.log("fetch",data);			
		})();
	}

	public render(): JSX.Element {
		const { fontSizeSettings} = this.props;
		return (
			<div className={`Inspector ${fontSizeSettings}`}>
				<TabList className="tabsRoot" activeKey={this.props.mainTab} onChange={this.props.setMainTab}>
					<TabPanel noPadding={true} id="descriptors" title="Descriptors" >
						<div className="descriptorsColumns">
							<Split
								sizes={/*Inspector.loaded ? columnSizesPercentage:*/[35, 65]}
								gutterSize={3}
							//onDragEnd={this.onSplitChange as any}
							//onDrag={(e)=>console.log(e)}
							>
								<LeftColumnContainer />
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
									<TabPanel id="reference" title="Code" >
										<GeneratedCodeContainer />
									</TabPanel>
									{/*<TabPanel id="info" title="Used filter" >
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
												</TabPanel>*/}
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
					<TabPanel id="amConverter" title="AM Converter" showScrollbars={true}>
						<AMConverterContainer />
					</TabPanel>
				</TabList>
				<FooterContainer />
				{this.state.showMessage && <div className="messageStrip"><a href={this.state.link} className="link">{this.state.message}</a><span className="close" onClick={this.closeMessage}><IconX /></span></div>}
			</div>
		);
	}
}

const mapStateToProps = (state: IRootState): IInspectorProps => {
	return {
		mainTab: getMainTabID(state),
		modeTab: getModeTabID(state),
		calculatedReference: getActiveDescriptorOriginalReference(state),
		columnSizesPercentage: [0, 0], //getColumnSizesPercentage(state),
		fontSizeSettings: getFontSizeSettings(state)
	};
};

const mapDispatchToProps: MapDispatchToPropsFunction<IInspectorDispatch, Record<string, unknown>> = (dispatch):IInspectorDispatch => {
	return {
		setMainTab: (key) => dispatch(setMainTabAction(key)),
		setModeTab: (key) => dispatch(setModeTabAction(key)),
		setWholeState: async () => {
			dispatch(replaceWholeStateAction(await Settings.importState()));
			Settings.loaded = true;
		},
		setColumnSize:(px)=>dispatch(setColumnSizeAction(px)),
	};
};

export const InspectorContainer = connect<IInspectorProps, IInspectorDispatch>(mapStateToProps, mapDispatchToProps)(Inspector);