import {useAppDispatch, useAppSelector} from "../../shared/store";

import React from "react";

import "./SorcererContainer.less";

import SP from "react-uxp-spectrum";
import {Footer} from "../../inspector/components/FooterContainer";
import {getFontSizeSettings} from "../../inspector/selectors/inspectorSelectors";
import {General} from "./GeneralContainer";
import {Snippet} from "./SnippetContainer";
import {Command} from "./CommandContainer";
import {IEntrypointCommand, IEntrypointPanel, ISnippet, ISorcererState} from "../sorModel";
import {getActiveItem, getAllCommands, getAllPanels, getAllSnippets, getManifestCode, shouldEnableRemove} from "../sorSelectors";
import {makeAction, removeAction, setPresetAction, setSelectAction} from "../sorActions";
import {Panel} from "./PanelContainer";
import {SorcererBuilder} from "../classes/Sorcerer";


export const Sorcerer: React.FC = () => {
	const dispatch = useAppDispatch();
	const fontSizeSettings = useAppSelector(getFontSizeSettings);
	const panels = useAppSelector(getAllPanels);
	const commands = useAppSelector(getAllCommands);
	const snippets = useAppSelector(getAllSnippets);
	const selectedItem = useAppSelector(getActiveItem);
	const manifestCode = useAppSelector(getManifestCode);
	const enableRemove = useAppSelector(shouldEnableRemove);
	const selectItem = (type: "panel" | "command" | "snippet" | "general", uuid: null | string) => dispatch(setSelectAction(type, uuid));
	const make = (type: "panel" | "command" | "snippet") => dispatch(makeAction(type));
	const remove = (type: "panel" | "command" | "snippet", uuid: string) => dispatch(removeAction(type, uuid));
	const setPreset = (data: ISorcererState) => dispatch(setPresetAction(data));
	const menuItemActiveClass = (item: IEntrypointCommand | IEntrypointPanel | ISnippet) => {
		if (!selectedItem) {
			return "";
		}

		if (selectedItem.type === item.type && item.$$$uuid === selectedItem.$$$uuid) {
			return "active";
		}
		return "";
	};

	const renderItems = (items: IEntrypointPanel[] | IEntrypointCommand[] | ISnippet[]) => {
		const res = items.map((p, index) => (
			<div key={index} className={"menuItem " + menuItemActiveClass(p)} onClick={() => selectItem(p.type, p.$$$uuid)}>
				{p.label.default || "(none)"}
			</div>
		));
		return res;
	};

	const exportFn = () => {
		SorcererBuilder.exportPreset();
	};

	const importFn = async () => {
		const data = await SorcererBuilder.importPreset();
		if (!data) {
			return;
		}
		setPreset(data);
	};

	return (
		<div className={`SorcererContainer ${fontSizeSettings}`} key={fontSizeSettings}>
			<div className="info spread flex">
				<div className="tree">
					<div className={"menuItem general " + (selectedItem?.type === "general" ? "active" : "")} onClick={() => selectItem("general", null)}>General</div>

					<div className="menuItemHeader"><span> Snippets</span><div className="button" title="Add new" onClick={() => make("snippet")}>+</div></div>
					{renderItems(snippets)}

					<div className="menuItemHeader"><span> Commands</span><div className="button" title="Add new" onClick={() => make("command")}>+</div></div>
					{renderItems(commands)}

					<div className="menuItemHeader"><span> Panels</span><div className="button" title="Add new" onClick={() => make("panel")}>+</div></div>
					{renderItems(panels)}

				</div>
				<div className="noShrink details">
					<General />
					<Snippet />
					<Command />
					<Panel />
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
					}}>Remove selected</div>
				<div className="spread"></div>
				<div className={"button"} onClick={exportFn}>Export as preset</div>
				<div className={"button"} onClick={importFn}>Import preset</div>
			</div>

			<Footer parentPanel="atnConverter" />
		</div>
	);
};
