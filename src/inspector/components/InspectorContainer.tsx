import {connect, MapDispatchToPropsFunction} from "react-redux";
import {setModeTabAction, setColumnSizeAction, toggleSettingsAction} from "../actions/inspectorActions";
import {IRootState} from "../../shared/store";
import {getModeTabID, getActiveDescriptorOriginalReference, getFontSizeSettings, getLeftColumnWidth, getRightColumnWidth, getSettingsVisible} from "../selectors/inspectorSelectors";

import React from "react";
import {TabList} from "./Tabs/TabList";
import {TabPanel} from "./Tabs/TabListPanel";
import "./InspectorContainer.less";
import {TActiveInspectorTab, TFontSizeSettings} from "../model/types";
import {FooterContainer} from "./FooterContainer";
import {TreeContentContainer} from "./TreeContentContainer";
import {TreeDiffContainer} from "./TreeDiff/TreeDiffContainer";
import {TreeDomContainer} from "./TreeDomContainer";
import {DispatcherContainer} from "./DispatcherContainer";
import {GeneratedCodeContainer} from "./GeneratedCodeContainer";
import {SettingsContainer} from "./Settings/SettingsContainer";
import {IconCog, IconX} from "../../shared/components/icons";
import {LeftColumnContainer} from "./LeftColumn";
import {SplitPane} from "../../shared/components/split-pane-fork/SplitPane";
import {Pane} from "../../shared/components/split-pane-fork/Pane";



const Inspector: React.FC<TInspector> = (props) => {
	const [showMessage, setShowMessage] = React.useState(false);
	const [message, setMessage] = React.useState("");
	const [link, setLink] = React.useState("");

	const closeMessage = () => {
		setShowMessage(false);
	};

	React.useEffect(() => {
		(async () => {
			const res = await fetch("http://alchemist.bereza.cz/alchemist-message.json");
			if (res.status !== 200) {
				return;
			}
			const data = await res.json();
			setMessage(data.message);
			setLink(data.link);
			setShowMessage(true);
			console.log("fetch", data);
		})();
	}, []);

	const {fontSizeSettings, leftColumnWidthPx, rightColumnWidthPx, setColumnSize, settingsVisible: visible, setToggleSettings} = props;

	const btnSettings = (
		<div className={"FilterButton settings " + (visible ? "on " : "off ")} title="Show settings" onClick={setToggleSettings}>
			<div className="icon flex row">{/*<IconCog />&nbsp;*/}<span> Settings</span></div>
		</div>
	);

	return (
		<div className={`Inspector ${fontSizeSettings}`} key={fontSizeSettings}>
			<div className="descriptorsColumns">
				<SplitPane primary="first" allowResize={true} pane1ClassName="" pane2ClassName="" paneClassName="" className="split" split="vertical" defaultSize={leftColumnWidthPx} onDragFinished={(px) => { setColumnSize(px, "left"); }} minSize={210}>
					<Pane className="leftPane">
						<LeftColumnContainer />
					</Pane>
					<SplitPane split="horizontal" primary="second" maxSize={25} minSize={25} defaultSize={25} allowResize={false} resizerStyle={{display: "none"}} pane1ClassName="" pane2ClassName="" paneClassName="">

						<Pane className="rightPane">
							<SplitPane
								className="split"
								split="vertical"
								defaultSize={visible ? rightColumnWidthPx : 0}
								onDragFinished={(px) => { setColumnSize(px, "right"); }}
								maxSize={visible ? undefined : 0}
								minSize={visible ? 200 : 0}
								primary={"second"}
								allowResize={true}
								pane1ClassName="contentPane"
								pane2ClassName=""
								paneClassName=""
							>
								<Pane className="rightPane" >
									<TabList
										className="tabsDescriptor"
										activeKey={props.modeTab}
										onChange={props.setModeTab}
										postFix={visible ? undefined : btnSettings}
									>
										<TabPanel id="content" title="Content" noPadding={true}>
											<TreeContentContainer />
										</TabPanel>
										<TabPanel id="difference" title="Difference" noPadding={true}>
											<TreeDiffContainer />
										</TabPanel>
										<TabPanel id="dom" title="DOM (live)" noPadding={true} >
											<TreeDomContainer />
										</TabPanel>
										<TabPanel id="reference" title="Code" noPadding={true}>
											<GeneratedCodeContainer />
										</TabPanel>
										<TabPanel id="dispatcher" title="Dispatch" marginRight={true}>
											<DispatcherContainer />
										</TabPanel>
									</TabList>
								</Pane>
								<Pane className="rightPane" style={{overflow: "auto"}}>
									{visible && <SettingsContainer />}
								</Pane>
							</SplitPane>
						</Pane>
						<Pane className="footerPane">
							<FooterContainer parentPanel="inspector" />

						</Pane>
					</SplitPane>
				</SplitPane>
			</div>

			{showMessage && <div className="messageStrip"><a href={link} className="link">{message}</a><span className="close" onClick={closeMessage}><IconX /></span></div>}
		</div>
	);
};

type TInspector = IInspectorProps & IInspectorDispatch

interface IInspectorState {
	showMessage: boolean
	message: string
	link: string
}

interface IInspectorProps {
	modeTab: TActiveInspectorTab
	calculatedReference: string
	leftColumnWidthPx: number
	rightColumnWidthPx: number
	fontSizeSettings: TFontSizeSettings
	settingsVisible: boolean
}

const mapStateToProps = (state: any): IInspectorProps => (state = state as IRootState, {
	modeTab: getModeTabID(state),
	calculatedReference: getActiveDescriptorOriginalReference(state),
	leftColumnWidthPx: getLeftColumnWidth(state),
	rightColumnWidthPx: getRightColumnWidth(state),
	fontSizeSettings: getFontSizeSettings(state),
	settingsVisible: getSettingsVisible(state),
});

interface IInspectorDispatch {
	setModeTab(mode: TActiveInspectorTab): void
	//setWholeState(): void
	setColumnSize(px: number, location: "left" | "right"): void
	setToggleSettings(): void
}

const mapDispatchToProps: MapDispatchToPropsFunction<IInspectorDispatch, Record<string, unknown>> = (dispatch): IInspectorDispatch => ({
	setModeTab: (key) => dispatch(setModeTabAction(key)),
	/*setWholeState: async () => {
		dispatch(replaceWholeStateAction(await Settings.importState()));
		Settings.loaded = true;
	},*/
	setColumnSize: (px, location: "left" | "right") => dispatch(setColumnSizeAction(px, location)),
	setToggleSettings: () => dispatch(toggleSettingsAction()),
});

export const InspectorContainer = connect<IInspectorProps, IInspectorDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Inspector);