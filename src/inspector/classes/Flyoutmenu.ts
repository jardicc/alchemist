import { rootStore } from "../../shared/store";
import { importItemsAction, importStateAction } from "../actions/inspectorActions";
import { TExportItems, TImportItems } from "../model/types";
import { getAllDescriptors, getSelectedDescriptors } from "../selectors/inspectorSelectors";
import { Settings } from "./Settings";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { entrypoints } = require("uxp");
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
		}
	}

	private static exportState = () => {
		const wholeState = rootStore.getState();
		Settings.saveSettingsWithDialog(wholeState);
	}

	private static exportItems = async (kind: TExportItems) => {
		const wholeState = rootStore.getState();
		
		const allItems = getAllDescriptors(wholeState);
		const selectedItems = getSelectedDescriptors(wholeState);
		Settings.exportDescriptorItems(kind === "all" ? allItems : selectedItems);
	}

	private static importState = async () => {
		const data = await Settings.importStateWithDialog();
		if (!data) { return; }
		dispatch(importStateAction(data));
	}
	
	private static importItems = async (kind: TImportItems) => {
		const data = await Settings.importStateWithDialog();
		if (!data) { return; }
		dispatch(importItemsAction(data, kind));
	}

	public static setup(): void {
		entrypoints.setup({
			panels: {
				inspector: {
					show() {
						// put any initialization code for your plugin here.
					},
					menuItems: [
						{
							id: "setWarpFactor", label: "Import",
							submenu: [
								{ id: "importAppState", label: "App state" },
								{ id: "importAddItems", label: "Add items" },
								{ id: "importReplaceItems", label: "Replace items" },
							],
						},
						
						{
							id: "raiseShields", label: "Export",
							submenu: [
								{ id: "exportAppState", label: "App state" },
								{ id: "exportAllItems", label: "All items" },
								{ id: "exportSelectedItems", label: "Selected items" },
							],
						},
						{ id: "spacer", label: "-" }, // SPACER
					],
					invokeMenu(id: string) {
						FlyoutMenu.handleFlyout(id);
					},
				},
			},
		});
	}
}