import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IInspectorState} from "../inspector/model/types";
import {getInitialState} from "../inspector/inspInitialState";
import {Settings} from "../inspector/classes/Settings";
import {makeSorCommand, makeSorPanel, makeSorSnippet} from "./sorInitialState";
import {
	IEntrypointCommand, IEntrypointPanel, IHost, IManifestInfo, ISnippet, ISorcererState,
} from "./sorModel";

export type TSetMainActionPayload = Partial<Pick<IManifestInfo, "name" | "id" | "version">>
export type TSetSnippetActionPayload = Partial<Pick<ISnippet, "label" | "code" | "version" | "author">>
export type TSetPanelActionPayload = Partial<Pick<IEntrypointPanel, "id" | "label">>
export type TSetCommandActionPayload = Partial<Pick<IEntrypointCommand, "id" | "label" | "$$$snippetUUID">>
export type TSetPanelHostActionPayload = Partial<Pick<IHost, "minVersion">>

const initialSorState = {} as IInspectorState;

export const sorSlice = createSlice({
	name: "sor",
	initialState: initialSorState,
	reducers: {
		select: {
			reducer(state, action: PayloadAction<{operation: "replace"; type: "panel" | "command" | "snippet" | "general"; uuid: string | null}>) {
				state.sorcerer.selectedItem = {
					kind: action.payload.type,
					uuid: action.payload.uuid,
				};
			},
			prepare(type: "panel" | "command" | "snippet" | "general", uuid: null | string = null) {
				return {payload: {operation: "replace" as const, uuid, type}};
			},
		},
		make: {
			reducer(state, action: PayloadAction<{type: "panel" | "command" | "snippet"}>) {
				switch (action.payload.type) {
					case "command": state.sorcerer.manifestInfo.entrypoints.push(makeSorCommand() as any); break;
					case "panel": state.sorcerer.manifestInfo.entrypoints.push(makeSorPanel() as any); break;
					case "snippet": state.sorcerer.snippets.list.push(makeSorSnippet() as any); break;
				}
			},
			prepare(type: "panel" | "command" | "snippet") {
				return {payload: {type}};
			},
		},
		remove: {
			reducer(state, action: PayloadAction<{type: "panel" | "command" | "snippet"; uuid: string}>) {
				switch (action.payload.type) {
					case "panel":
					case "command": {
						const index = state.sorcerer.manifestInfo.entrypoints.findIndex(item => item.$$$uuid === action.payload.uuid);
						if (index !== -1) {state.sorcerer.manifestInfo.entrypoints.splice(index, 1);}
						break;
					}
					case "snippet": {
						const index = state.sorcerer.snippets.list.findIndex(item => item.$$$uuid === action.payload.uuid);
						if (index !== -1) {state.sorcerer.snippets.list.splice(index, 1);}
						break;
					}
				}
				state.sorcerer.selectedItem.kind = "general";
				state.sorcerer.selectedItem.uuid = null;
			},
			prepare(type: "panel" | "command" | "snippet", uuid: string) {
				return {payload: {type, uuid}};
			},
		},
		setMain(state, action: PayloadAction<TSetMainActionPayload>) {
			state.sorcerer.manifestInfo = {
				...state.sorcerer.manifestInfo,
				...action.payload,
			};
		},
		setPanel: {
			reducer(state, action: PayloadAction<{value: TSetPanelActionPayload; uuid: string}>) {
				const index = state.sorcerer.manifestInfo.entrypoints.findIndex(e => e.type === "panel" && e.$$$uuid === action.payload.uuid);
				if (index !== -1) {
					state.sorcerer.manifestInfo.entrypoints[index] = {
						...state.sorcerer.manifestInfo.entrypoints[index],
						...action.payload.value,
					};
				}
			},
			prepare(arg: TSetPanelActionPayload, uuid: string) {
				return {payload: {value: arg, uuid}};
			},
		},
		setSnippet: {
			reducer(state, action: PayloadAction<{value: TSetSnippetActionPayload; uuid: string}>) {
				const index = state.sorcerer.snippets.list.findIndex(e => e.$$$uuid === action.payload.uuid);
				if (index !== -1) {
					state.sorcerer.snippets.list[index] = {
						...state.sorcerer.snippets.list[index],
						...action.payload.value,
					};
				}
			},
			prepare(arg: TSetSnippetActionPayload, uuid: string) {
				return {payload: {value: arg, uuid}};
			},
		},
		setCommand: {
			reducer(state, action: PayloadAction<{value: TSetCommandActionPayload; uuid: string}>) {
				const index = state.sorcerer.manifestInfo.entrypoints.findIndex(e => e.type === "command" && e.$$$uuid === action.payload.uuid);
				if (index !== -1) {
					state.sorcerer.manifestInfo.entrypoints[index] = {
						...state.sorcerer.manifestInfo.entrypoints[index],
						...action.payload.value,
					};
				}
			},
			prepare(arg: TSetCommandActionPayload, uuid: string) {
				return {payload: {value: arg, uuid}};
			},
		},
		assignSnippetToPanel: {
			reducer(state, action: PayloadAction<{operation: "on" | "off"; uuid: string; snippetUuid: string}>) {
				const {operation, uuid, snippetUuid} = action.payload;
				const index = state.sorcerer.manifestInfo.entrypoints.findIndex(entryPoint => entryPoint.type === "panel" && entryPoint.$$$uuid === uuid);

				if (index !== -1) {
					const found = state.sorcerer.manifestInfo.entrypoints[index] as IEntrypointPanel;
					if (operation === "on") {
						if (!found.$$$snippetUUIDs.includes(snippetUuid)) {
							found.$$$snippetUUIDs.push(snippetUuid);
						}
					} else if (operation === "off") {
						const i = found.$$$snippetUUIDs.indexOf(snippetUuid);
						if (i !== -1) {found.$$$snippetUUIDs.splice(i, 1);}
					}
				}
			},
			prepare(operation: "on" | "off", uuid: string, snippetUuid: string) {
				return {payload: {operation, uuid, snippetUuid}};
			},
		},
		setHostApp: {
			reducer(state, action: PayloadAction<{app: "PS" | "XD"; arg: TSetPanelHostActionPayload}>) {
				const found = state.sorcerer.manifestInfo.host.find(host => host.app === action.payload.app);
				if (found) {Object.assign(found, action.payload.arg);}
			},
			prepare(app: "PS" | "XD", arg: TSetPanelHostActionPayload) {
				return {payload: {app, arg}};
			},
		},
		setPreset(state, action: PayloadAction<ISorcererState>) {
			state.sorcerer = action.payload;
		},
	},
});

export const sorSliceReducer = sorSlice.reducer;
