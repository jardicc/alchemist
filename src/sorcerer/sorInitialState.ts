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
			entrypoints: [{
				type: "command",
				id: "commandID",
				label: { default: "Label text" },
				$$$snippetUUID: null,
				$$$uuid: Helpers.uuidv4(),
			}, {
				type: "panel",
				id: "commandID",
				label: { default: "Label text" },
				icons: [],
				minimumSize: { height: 100, width: 100 },
				maximumSize: { height: 100, width: 100 },
				preferredDockedSize: { height: 100, width: 100 },
				preferredFloatingSize: { height: 100, width: 100 },
				$$$snippetUUIDs: [],
				$$$uuid: Helpers.uuidv4(),
			}],
			host: [{
				app: "PS",
				minVersion: "23.0.0",
				data: { apiVersion: 2 },
			}],
			icons: [],
		},
		selectedItem: {
			kind: "general",
			uuid: null,
		},
		snippets: {
			list: [{
				type: "snippet",
				label: { default: "makeLayer" },
				author: "noName",
				code: "console.log('abc');",
				$$$uuid: Helpers.uuidv4(),
				version: "1.0.0",
			}],
		},
	};
}

export function makeSorSnippet(): ISnippet {
	return {
		type: "snippet",
		label: { default: "New document" },
		author: "noName",
		code: "console.log('abc');",
		$$$uuid: Helpers.uuidv4(),
		version: "1.0.0",
	};
}

export function makeSorPanel(): IEntrypointPanel {
	return {
		type: "panel",
		id: "commandID",
		label: { default: "Label text" },
		icons: [],
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