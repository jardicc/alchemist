import { Helpers } from "../inspector/classes/Helpers";
import { IEntrypointCommand, IEntrypointPanel, ISnippet, ISorcererState } from "./sorModel";

export function getSorInitialState(): ISorcererState {
	return {
		general: {
			
		},
		manifestInfo: {
			manifestVersion: 5,
			name: "pluginName",
			version: "1.0.0",
			id: "pluginID",
			main: "index.html",
			requiredPermissions: {
				launchProcess: "request",
			},
			entrypoints: [
				makeSorCommand(),
				makeSorPanel()
			],
			host: [{
				app: "PS",
				minVersion: "23.0.0",
				data: { apiVersion: 2 },
			}],
			icons: [{
				"width": 48,
				"height": 48,
				"scale": [1,2],
				"path": "CHANGE_THIS_relative_path_to_light_icon.png",
				"theme": ["medium","lightest", "light"],
				"species": ["pluginList"]
			},
			{
				"width": 48,
				"height": 48,
				"scale": [1,2],
				"path": "CHANGE_THIS_relative_path_to_dark_icon.png",
				"theme": ["darkest", "dark"],
				"species": ["pluginList"]
			}],
		},
		selectedItem: {
			kind: "general",
			uuid: null,
		},
		snippets: {
			list: [
				makeSorSnippet()
			],
		},
	};
}

export function makeSorSnippet(): ISnippet {
	return {
		type: "snippet",
		label: { default: "New document" },
		author: "noName",
		code: "console.log('abc');",
		$$$uuid: Helpers.uuidCustom(),
		version: "1.0.0",
	};
}

export function makeSorPanel(): IEntrypointPanel {
	return {
		type: "panel",
		id: "commandID",
		label: { default: "Label text" },
		icons: [
			{
				"width": 23,
				"height": 23,
				"scale": [1, 2],
				"path": "CHANGE_THIS_relative_path_to_dark_panel_icon.png",
				"theme": ["darkest", "dark", "medium"]
			}, {
				"width": 23,
				"height": 23,
				"scale": [1, 2],
				"path": "CHANGE_THIS_relative_path_to_light_panel_icon.png",
				"theme": ["lightest", "light"]
			}
		],
		minimumSize: { height: 100, width: 100 },
		maximumSize: { height: 100, width: 100 },
		preferredDockedSize: { height: 100, width: 100 },
		preferredFloatingSize: { height: 100, width: 100 },
		$$$snippetUUIDs: [],
		$$$uuid: Helpers.uuidv4(),
	};
}

export function makeSorCommand(): IEntrypointCommand {
	return {
		type: "command",
		id: "commandID",
		label: { default: "Label text" },
		$$$snippetUUID: null,
		$$$uuid: Helpers.uuidv4(),
	};
}