import { connect, MapDispatchToPropsFunction } from "react-redux";
import { IRootState } from "../../../shared/store";

import React from "react";

import "./../../../shared/ThemeVars.css";
import "./../../../shared/styles.less";
import "./SorcererContainer.less";

import SP from "react-uxp-spectrum";
import { TFontSizeSettings } from "../../../inspector/model/types";
import { FooterContainer } from "../../../inspector/components/Footer/FooterContainer";
import { getFontSizeSettings } from "../../../inspector/selectors/inspectorSelectors";
import { IActionSetUUID } from "../../../atnDecoder/atnModel";
import { GeneralContainer } from "../GeneralContainer/GeneralContainer";
import { SnippetContainer } from "../SnippetsContainer/SnippetContainer";
import { Command, CommandContainer } from "../CommandsContainer/CommandContainer";
import { IEntrypointCommand, IEntrypointPanel, ISnippet } from "../../sorModel";
import { getActiveItem, getAllCommands, getAllPanels, getAllSnippets, getManifestCode, shouldEnableRemove } from "../../sorSelectors";
import { setSelectActionAction } from "../../../atnDecoder/atnActions";
import { makeAction, removeAction, setSelectAction } from "../../sorActions";
import { PanelContainer } from "../PanelsContainer/PanelContainer";
import { SorcererBuilder } from "../../classes/Sorcerer";


class Sorcerer extends React.Component<TSorcerer, ISorcererState> { 
	constructor(props: TSorcerer) {
		super(props);
	}

	private menuItemActiveClass = (item:IEntrypointCommand|IEntrypointPanel|ISnippet) => {
		const { selectedItem } = this.props;
		if (!selectedItem) {
			return "";
		}
		
		if (selectedItem.type === item.type && item.$$$uuid === selectedItem.$$$uuid) {
			return "active";
		}
		return "";
	}

	private renderItems = (items: IEntrypointPanel[] | IEntrypointCommand[] | ISnippet[]) => {
		const { selectItem} = this.props;
		const res = items.map((p, index) => (
			<div key={index} className={"menuItem " + this.menuItemActiveClass(p)} onClick={()=>selectItem(p.type,p.$$$uuid)}>
				{p.label.default || "(none)"}
			</div>
		));
		return res;
	}

	public render(): JSX.Element {
		const { fontSizeSettings,commands,snippets,panels,selectItem,make,remove,selectedItem, manifestCode, enableRemove } = this.props;

		return (
			<div className={`SorcererContainer ${fontSizeSettings}`}>
				<div className="info spread flex">
					<div className="tree">
						<div className={"menuItem general " + (this.props.selectedItem?.type === "general" ? "active" : "")} onClick={() => selectItem("general", null)}>General</div>

						<div className="menuItemHeader"><span> Snippets</span><div className="button" onClick={() => make("snippet")}>+</div></div>
						{this.renderItems(snippets)}

						<div className="menuItemHeader"><span> Commands</span><div className="button" onClick={() => make("command")}>+</div></div>
						{this.renderItems(commands)}

						<div className="menuItemHeader"><span> Panels</span><div className="button" onClick={() => make("panel")}>+</div></div>
						{this.renderItems(panels)}

					</div>
					<div className="noShrink details">
						<GeneralContainer />
						<SnippetContainer />
						<CommandContainer />
						<PanelContainer />
					</div>
					<div className="manifest">
						<SP.Textarea className="manifestCode" value={manifestCode} />
					</div>
				</div>
				<div className="buttonBar">
					<div className={"button"} onClick={() => SorcererBuilder.buildPlugin()}>Build plugin</div>
					<div className={"button " + (enableRemove ? "" : "disallowed")}
						onClick={() => {
							const s = selectedItem as ISnippet | IEntrypointPanel | IEntrypointCommand;
							remove(s.type as "snippet" | "panel" | "command", s.$$$uuid);
						}}>Remove</div>
					<div className="spread"></div>
					<div className={"button"}>Export as preset</div>
					<div className={"button"}>Import preset</div>
				</div>

				<FooterContainer parentPanel="atnConverter" />
			</div>
		);
	}
}



type TSorcerer = ISorcererProps & ISorcererDispatch

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISorcererState{

}

interface ISorcererProps{
	fontSizeSettings: TFontSizeSettings
	panels: IEntrypointPanel[]
	commands: IEntrypointCommand[]
	snippets: ISnippet[]
	selectedItem: ISnippet | IEntrypointPanel | IEntrypointCommand | { type: "general" }
	manifestCode: string
	enableRemove:boolean
}

const mapStateToProps = (state: IRootState): ISorcererProps => (state = state as IRootState,{
	fontSizeSettings: getFontSizeSettings(state),
	panels: getAllPanels(state),
	commands:getAllCommands(state),
	snippets: getAllSnippets(state),
	selectedItem: getActiveItem(state),
	manifestCode: getManifestCode(state),
	enableRemove: shouldEnableRemove(state),
});

interface ISorcererDispatch {
	setData?(data: IActionSetUUID[]): void
	selectItem(type: "panel" | "command" | "snippet" | "general", uuid: null | string): void
	make(type: "panel" | "command" | "snippet"): void
	remove(type: "panel" | "command" | "snippet", uuid: string): void
}

const mapDispatchToProps: MapDispatchToPropsFunction<ISorcererDispatch, Record<string, unknown>> = (dispatch): ISorcererDispatch => ({
	//setData: (data) => dispatch(setDataAction(data)),
	selectItem: (type, uuid) => dispatch(setSelectAction(type, uuid)),
	make:(type)=>dispatch(makeAction(type)),
	remove:(type,uuid)=>dispatch(removeAction(type,uuid)),
});

export const SorcererContainer = connect<ISorcererProps, ISorcererDispatch, Record<string, unknown>, IRootState>(mapStateToProps, mapDispatchToProps)(Sorcerer);