import {useAppDispatch, useAppSelector} from "../../shared/store";
import {setModeTabAction, setColumnSizeAction, toggleSettingsAction} from "../actions/inspectorActions";
import {getModeTabID, getActiveDescriptorOriginalReference, getFontSizeSettings, getLeftColumnWidth, getRightColumnWidth, getSettingsVisible} from "../selectors/inspectorSelectors";

import React from "react";
import {TabList} from "./Tabs/TabList";
import {TabPanel} from "./Tabs/TabListPanel";
import "./InspectorContainer.less";
import {TActiveInspectorTab, TFontSizeSettings} from "../model/types";
import {Footer} from "./FooterContainer";
import {TreeContent} from "./TreeContentContainer";
import {TreeDiff} from "./TreeDiff/TreeDiffContainer";
import {TreeDom} from "./TreeDomContainer";
import {Dispatcher} from "./DispatcherContainer";
import {GeneratedCode} from "./GeneratedCodeContainer";
import {Settings} from "./Settings/SettingsContainer";
import {IconCog, IconX} from "../../shared/components/icons";
import {LeftColumn} from "./LeftColumn";
import {SplitPane} from "../../shared/components/split-pane-fork/SplitPane";
import {Pane} from "../../shared/components/split-pane-fork/Pane";

export const Inspector: React.FC = () => {
	const dispatch = useAppDispatch();
	const modeTab = useAppSelector(getModeTabID);
	const leftColumnWidthPx = useAppSelector(getLeftColumnWidth);
	const rightColumnWidthPx = useAppSelector(getRightColumnWidth);
	const fontSizeSettings = useAppSelector(getFontSizeSettings);
	const visible = useAppSelector(getSettingsVisible);
	const setModeTab = (key: TActiveInspectorTab) => dispatch(setModeTabAction(key));
	const setColumnSize = (px: number, location: "left" | "right") => dispatch(setColumnSizeAction(px, location));
	const setToggleSettings = () => dispatch(toggleSettingsAction());
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
						<LeftColumn />
					</Pane>
					<SplitPane split="horizontal" primary="second" maxSize={25} minSize={25} defaultSize={25} allowResize={false} resizerStyle={{display: "none"}} pane1ClassName="" pane2ClassName="" paneClassName="">

						<Pane className="rightPane">
							<SplitPane
								className="split"
								split="vertical"
								size={visible ? rightColumnWidthPx : 0}
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
										activeKey={modeTab}
										onChange={setModeTab}
										postFix={visible ? undefined : btnSettings}
									>
										<TabPanel id="content" title="Content" noPadding={true}>
											<TreeContent />
										</TabPanel>
										<TabPanel id="difference" title="Difference" noPadding={true}>
											<TreeDiff />
										</TabPanel>
										<TabPanel id="dom" title="DOM (live)" noPadding={true} >
											<TreeDom />
										</TabPanel>
										<TabPanel id="reference" title="Code" noPadding={true}>
											<GeneratedCode />
										</TabPanel>
										<TabPanel id="dispatcher" title="Dispatch" marginRight={true}>
											<Dispatcher />
										</TabPanel>
									</TabList>
								</Pane>
								<Pane className="rightPane" style={{overflow: "auto"}}>
									{visible && <Settings />}
								</Pane>
							</SplitPane>
						</Pane>
						<Pane className="footerPane">
							<Footer parentPanel="inspector" />

						</Pane>
					</SplitPane>
				</SplitPane>
			</div>

			{showMessage && <div className="messageStrip"><a href={link} className="link">{message}</a><span className="close" onClick={closeMessage}><IconX /></span></div>}
		</div>
	);
};
