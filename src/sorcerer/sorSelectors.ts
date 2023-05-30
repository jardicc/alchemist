/* eslint-disable indent */
import { cloneDeep } from "lodash";
import { createSelector } from "reselect";
import { getIndentString } from "../inspector/selectors/inspectorCodeSelectors";
import { getInspectorSettings } from "../inspector/selectors/inspectorSelectors";
import { IRootState } from "../shared/store";

import { IEntrypointCommand, IEntrypointPanel, ISorcererState } from "./sorModel";

export const all = (state:IRootState):ISorcererState => state.inspector.sorcerer;
export const getManifestGeneric = createSelector([all], s => s.manifestInfo);


export const getAllSnippets = createSelector([all], s => {	
	return s.snippets.list;
});

export const getActiveSnippet = createSelector([all, getAllSnippets], (s,snippets) => {
	if (s.selectedItem.kind !== "snippet" || typeof s.selectedItem.uuid !== "string") {
		return null;
	}
	const res = snippets.find(item => item.$$$uuid === s.selectedItem.uuid) || null;
	return res;
});

export const getAllEntryPoints = createSelector([all], s => {
	return s.manifestInfo.entrypoints;
});

export const getActiveCommand = createSelector([all, getAllEntryPoints], (s, entryPoints) => {
	if (s.selectedItem.kind !== "command" || typeof s.selectedItem.uuid !== "string") {
		return null;
	}

	const res:IEntrypointCommand |null = entryPoints.find(item => item.$$$uuid === s.selectedItem.uuid && item.type === "command") as IEntrypointCommand || null;
	return res;
});

export const getActivePanel = createSelector([all, getAllEntryPoints], (s, entryPoints) => {
	if (s.selectedItem.kind !== "panel" || typeof s.selectedItem.uuid !== "string") {
		return null;
	}

	const res = entryPoints.find(item => item.$$$uuid === s.selectedItem.uuid && item.type === "panel") as IEntrypointPanel || null;
	return res;
});


export const getAllCommands = createSelector([getAllEntryPoints], s => {
	const res: IEntrypointCommand[] = s.filter(item => item.type === "command") as IEntrypointCommand[];
	return res;
});

export const getAllPanels = createSelector([getAllEntryPoints], s => {
	const res: IEntrypointPanel[] = s.filter(item => item.type === "panel") as IEntrypointPanel[];
	return res;
});

export const isGenericModuleVisible = createSelector([all], s => {
	const res = s.selectedItem.kind === "general";
	return res;
});

export const getActiveItem = createSelector([getActiveSnippet, getActiveCommand, getActiveCommand, getActivePanel, isGenericModuleVisible],(activeSnippet, activeEntryPoint, activeCommand, activePanel, genericModuleVisible) => {
	const res = activeSnippet || activeEntryPoint || activeCommand || activePanel || (genericModuleVisible ? {type:"general"} : null);
	return res;
});

export const getManifestCode = createSelector([all, getIndentString], (all, indent) => {

	const clone:any = cloneDeep(all.manifestInfo);

	clone.entrypoints.forEach((ep:any) => {
		delete ep.$$$uuid;
		if (ep.type === "command") {
			delete ep.$$$snippetUUID;
		} else if (ep.type === "panel") {
			if (!ep.icons.length) {
				delete ep.icons;
			}
			delete ep.$$$snippetUUIDs;
		}
	});

	if (!clone.icons.length) {
		delete clone.icons;
	}

	if (Array.isArray(clone.host)) {
		clone.host = clone.host[0] as any;
	}

	const str = JSON.stringify(clone, null, indent);
	return str;
});

export const shouldEnableRemove = createSelector([all], (all) => {
	const res = all.selectedItem.kind !== "general";
	return res;
});

export const generateScriptFileCode = createSelector([getAllCommands, getAllPanels,getAllSnippets], (commands, panels,snippets) => {
	
	const str=
	`const { entrypoints } = require("uxp");

	// assign code the commands in Photoshop main menu

	entrypoints.setup({
		commands: {
			${commands.map(c=>`${c.id}: () => ${c.$$$snippetUUID}(),\n\t\t\t`).join("")}
		}
	});

	// assign on click event for all buttons in all panels
	document.onload=()=>{
		${snippets.map(s => {
			return `
			// ${s.label.default}
			[...document.body.querySelectorAll('[data-snippet="${s.$$$uuid}"]')].forEach(button => button.addEventListener("click",${s.$$$uuid}));`;
		}).join("\n")}
	}

	// your code snippets
	${snippets.map(snippet =>
	`/** ${snippet?.label.default ?? ""} */
	async function ${snippet?.$$$uuid ?? ""}(){
		${snippet?.code ?? "" }
	}\n\t`,
	).join("")}
	`;
	return str;
});

export const generateHtmlFileCode = createSelector([getAllPanels,getAllSnippets], (panels,snippets) => {

	function generatePanel(panel:IEntrypointPanel):string {
		const str = `
		<uxp-panel panelid="${panel.id}">
			${panel.$$$snippetUUIDs.map(snippetUUID => {
				const found = snippets.find(s => s.$$$uuid === snippetUUID);
				if (found) {
					return `<sp-action-button data-snippet="${found.$$$uuid}">${found.label.default}</sp-action-button>`;
				} else {
					return "";
				}
			}).join("\n")}
		</uxp-panel>
		`;

		return str;
	}

	const html = `
	<html>
	<head>
		<script src="index.js"></script>    
		<style>
			body {
				color: white;
				padding: 0 16px;
			}

			sp-action-button {
				width:100%;
			}

			li:before {
				content: '• ';
				width: 3em;
			}
	
			#layers {
				border: 1px solid #808080;
				border-radius: 4px;
				padding: 16px;
			}
		</style>
	</head>
	<body>
		${panels.map(p => generatePanel(p)).join("\n")}
	</body>
	</html>
	`;
	return html;
});