import {rootStore} from "../../shared/store";
import {importItemsAction, importStateAction} from "../actions/inspectorActions";
import {TExportItems, TImportItems} from "../model/types";
import {getAllDescriptors, getSelectedDescriptors} from "../selectors/inspectorSelectors";
import {Settings} from "./Settings";
import manifest from "../../../uxp/manifest.json";
import {Main} from "../../shared/classes/Main";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {entrypoints} = require("uxp");
const {dispatch} = rootStore;

export class FlyoutMenu {
	constructor() {
		//
	}

	private static handleFlyout(id: string) {
		console.log(id);
		switch (id) {
			case "importAppState":
				FlyoutMenu.importState();
				break;
			case "importAddItems":
				FlyoutMenu.importItems("append");
				break;
			case "importReplaceItems":
				FlyoutMenu.importItems("replace");
				break;

			case "exportAppState":
				FlyoutMenu.exportState();
				break;
			case "exportAllItems":
				FlyoutMenu.exportItems("all");
				break;
			case "exportSelectedItems":
				FlyoutMenu.exportItems("selected");
				break;

			case "reset":
				Settings.reset();
				break;
			case "reload":
				location.reload();
				break;
			case "showAll":
				FlyoutMenu.showAll();
				break;
		}
	}

	private static showAll = async () => {
		manifest.entryPoints.forEach(e => {
			if (e.type === "panel") {
				Main.plugin.showPanel(e.id);
			}
		});
	};

	private static exportState = () => {
		const wholeState = rootStore.getState();
		Settings.saveSettingsWithDialog(wholeState);
	};

	private static exportItems = async (kind: TExportItems) => {
		const wholeState = rootStore.getState();

		const allItems = getAllDescriptors(wholeState);
		const selectedItems = getSelectedDescriptors(wholeState);
		Settings.exportDescriptorItems(kind === "all" ? allItems : selectedItems);
	};

	private static importState = async () => {
		const data = await Settings.importStateWithDialog();
		if (!data) {return;}
		dispatch(importStateAction(data));
	};

	private static importItems = async (kind: TImportItems) => {
		const data = await Settings.importStateWithDialog();
		if (!data) {return;}
		dispatch(importItemsAction(data, kind));
	};

	public static setup(): void {

		const repairSubMenu = {
			id: "groupProblem", label: "Repair",
			submenu: [
				{id: "reload", label: "Reload"},
				{id: "reset", label: "Reset settings"},
				{id: "showAll", label: "Show all panels"},
			],
		};

		entrypoints.setup({
			panels: {
				inspector: {
					show() {
						// put any initialization code for your plugin here.
					},
					menuItems: [
						{
							id: "groupImport", label: "Import",
							submenu: [
								{id: "importAppState", label: "App state"},
								{id: "importAddItems", label: "Add items"},
								{id: "importReplaceItems", label: "Replace items"},
							],
						},

						{
							id: "groupExport", label: "Export",
							submenu: [
								{id: "exportAppState", label: "App state"},
								{id: "exportAllItems", label: "All items"},
								{id: "exportSelectedItems", label: "Selected items"},
							],
						},
						{id: "spacer", label: "-"}, // SPACER
						repairSubMenu,
						{id: "spacer2", label: "-"}, // SPACER
					],
					invokeMenu(id: string) {
						FlyoutMenu.handleFlyout(id);
					},
				},
			},
		});
	}
}