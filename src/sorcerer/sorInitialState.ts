import { ISorcererState } from "./sorModel";

export function getSorInitialState(): ISorcererState {
	return {
		general: {
			
		},
		manifestInfo: {
			manifestVersion: 5,
			name: "pluginName",
			version: "1.0.0",
			id: "abc",
			main: "index.html",
			requiredPermissions: {
				launchProcess: "request",
			},
			entrypoints: [{
				type: "command",
				id: "abcd",
				label: { default: "Label text" },
				$$$snippetUUID: "abcd",
			}],
			host: [{
				app: "PS",
				minVersion: "23.0.0",
				data: { apiVersion: 2 },
			}],
			icons: [],
		},
		selectedItem: {
			kind: "entryPoint",
			index: 0,
		},
		snippets: {
			list: [{
				name: "makeLayer",
				author: "noName",
				code: "console.log('abc');",
				uuid: "abcde",
				version: "1.0.0",
			}],
		},
	};
}