/**
 * @jest-environment jsdom
 */
import React from "react";
import {screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {renderWithStore} from "../../../__tests__/renderWithStore";

import {Snippet} from "../SnippetContainer";
import {Command} from "../CommandContainer";
import {Panel} from "../PanelContainer";
import {General} from "../GeneralContainer";

const makeSnippet = (over: Partial<any> = {}) => ({
	type: "snippet",
	$$$uuid: "s1",
	label: {default: "Snippet 1"},
	author: "Bob",
	version: "1.0.0",
	code: "console.log(1)",
	...over,
});

const makeCommand = (over: Partial<any> = {}) => ({
	type: "command",
	$$$uuid: "c1",
	id: "cmd1",
	label: {default: "Cmd 1"},
	$$$snippetUUID: "s1",
	...over,
});

const makePanel = (over: Partial<any> = {}) => ({
	type: "panel",
	$$$uuid: "p1",
	id: "pan1",
	label: {default: "Pan 1"},
	$$$snippetUUIDs: ["s1"],
	...over,
});

const baseSorcererState = (sorcerer: any): any => ({
	inspector: {
		descriptors: [],
		selectedReferenceType: "layer",
		filterBySelectedReferenceType: "off",
		explicitlyVisibleTopCategories: [],
		targetReference: {layer: {type: "layer", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", filterLayer: "off", layerID: "selected"}},
		settings: {searchTerm: null, listenerFilter: {type: "none", exclude: [], include: []}, notifierFilter: {type: "none", exclude: [], include: []}, autoUpdateInspector: false, activeDescriptors: [], accordionExpandedIDs: [], indentCode: "\t", indentOutput: ""},
		inspector: {activeTab: "content", content: {viewType: "tree", search: "", treePath: [], autoExpandLevels: 0, expandedTree: []}, dom: {treePath: [], autoExpandLevels: 0, expandedTree: []}, difference: {viewType: "tree", treePath: [], autoExpandLevels: 0, expandedTree: []}},
		sorcerer,
	},
});

const manifest: any = {
	manifestVersion: 5,
	name: "MyPlugin",
	id: "id-123",
	main: "index.html",
	version: "2.0.0",
	host: [
		{app: "PS", minVersion: "23.0", data: {apiVersion: 2}},
	],
	entrypoints: [],
	icons: [],
	requiredPermissions: {},
};

describe("<Snippet /> (sorcerer)", () => {
	it("renders nothing when activeSnippet is null", () => {
		const state = baseSorcererState({selectedItem: {kind: "general", uuid: null}, snippets: {list: []}, manifestInfo: manifest});
		const {container} = renderWithStore(<Snippet />, {preloadedState: state});
		expect(container.firstChild).toBeNull();
	});

	it("renders snippet fields", () => {
		const state = baseSorcererState({selectedItem: {kind: "snippet", uuid: "s1"}, snippets: {list: [makeSnippet()]}, manifestInfo: manifest});
		const {container} = renderWithStore(<Snippet />, {preloadedState: state});
		expect(container.querySelector(".SnippetContainerContainer")).not.toBeNull();
		expect(container.textContent).toMatch(/Name/);
		expect(container.textContent).toMatch(/Version/);
		expect(container.textContent).toMatch(/Author/);
		expect(container.textContent).toMatch(/Code/);
	});
});

describe("<Command /> (sorcerer)", () => {
	it("renders nothing when activeCommand is null", () => {
		const state = baseSorcererState({selectedItem: {kind: "general", uuid: null}, snippets: {list: []}, manifestInfo: {...manifest, entrypoints: []}});
		const {container} = renderWithStore(<Command />, {preloadedState: state});
		expect(container.firstChild).toBeNull();
	});

	it("renders the command panel and an option per snippet", () => {
		const cmd = makeCommand();
		const state = baseSorcererState({
			selectedItem: {kind: "command", uuid: "c1"},
			snippets: {list: [makeSnippet(), makeSnippet({$$$uuid: "s2", label: {default: "Snippet 2"}})]},
			manifestInfo: {...manifest, entrypoints: [cmd]},
		});
		const {container} = renderWithStore(<Command />, {preloadedState: state});
		expect(container.querySelector(".CommandContainerContainer")).not.toBeNull();
		expect(container.textContent).toMatch(/Label/);
		expect(container.textContent).toMatch(/ID/);
		expect(container.textContent).toMatch(/Snippet 1/);
		expect(container.textContent).toMatch(/Snippet 2/);
	});
});

describe("<Panel /> (sorcerer)", () => {
	it("renders nothing when activePanel is null", () => {
		const state = baseSorcererState({selectedItem: {kind: "general", uuid: null}, snippets: {list: []}, manifestInfo: {...manifest, entrypoints: []}});
		const {container} = renderWithStore(<Panel />, {preloadedState: state});
		expect(container.firstChild).toBeNull();
	});

	it("renders one checkbox per snippet", () => {
		const panel = makePanel();
		const state = baseSorcererState({
			selectedItem: {kind: "panel", uuid: "p1"},
			snippets: {list: [makeSnippet(), makeSnippet({$$$uuid: "s2", label: {default: "S2"}})]},
			manifestInfo: {...manifest, entrypoints: [panel]},
		});
		const {container} = renderWithStore(<Panel />, {preloadedState: state});
		expect(container.querySelector(".PanelContainerContainer")).not.toBeNull();
		expect(container.textContent).toContain("Snippet 1");
		expect(container.textContent).toContain("S2");
	});
});

describe("<General /> (sorcerer)", () => {
	it("renders nothing when isGenericVisible=false", () => {
		const state = baseSorcererState({selectedItem: {kind: "snippet", uuid: "s1"}, snippets: {list: [makeSnippet()]}, manifestInfo: manifest});
		const {container} = renderWithStore(<General />, {preloadedState: state});
		expect(container.firstChild).toBeNull();
	});

	it("renders the manifest fields and host info when visible", () => {
		const state = baseSorcererState({selectedItem: {kind: "general", uuid: null}, snippets: {list: []}, manifestInfo: manifest});
		renderWithStore(<General />, {preloadedState: state});
		expect(screen.getByText("PS")).toBeInTheDocument();
	});
});
