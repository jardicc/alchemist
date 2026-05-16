/**
 * @jest-environment jsdom
 */
import React from "react";
import {within} from "@testing-library/react";
import "@testing-library/jest-dom";

// Stub the redux-connected children so we can render <Filters /> in isolation
// and just count how many filter rows appear for a given activeRef.type.
jest.mock("../FilterRow", () => {
	const React = require("react");
	const FilterRow = (props: any) =>
		React.createElement("div", {
			"data-testid": "filter-row",
			"data-subtype": props.subtype,
			"data-header": typeof props.header === "string" ? props.header : "",
		});
	return {FilterRow};
});

jest.mock("../ListenerFilterContainer", () => {
	const React = require("react");
	return {
		ListenerFilter: () =>
			React.createElement("div", {"data-testid": "listener-filter-stub"}),
	};
});

jest.mock("../ItemVisibilityButton", () => ({
	ItemVisibilityButtonWrap: () => null,
}));

jest.mock("../../classes/GetList", () => ({
	GetList: {
		getDocuments: jest.fn(),
		getLayers: jest.fn(),
		getChannels: jest.fn(),
		getPaths: jest.fn(),
		getActionSets: jest.fn(),
		getActionItem: jest.fn(),
		getActionCommands: jest.fn(),
		getGuides: jest.fn(),
		getHistory: jest.fn(),
		getSnapshots: jest.fn(),
	},
}));

import {Filters} from "../Filters";
import {renderWithStore} from "../../../__tests__/renderWithStore";

const makeState = (selectedReferenceType: string, refData: any, properties: any[] = []): any => ({
	inspector: {
		descriptors: [],
		selectedReferenceType,
		filterBySelectedReferenceType: "off",
		explicitlyVisibleTopCategories: [],
		targetReference: {
			listener: {type: "listener"},
			dispatcher: {type: "dispatcher"},
			notifier: {type: "notifier"},
			replies: {type: "replies"},
			generator: {type: "generator"},
			application: {type: "application", filterProp: "off", properties: []},
			document: {type: "document", filterProp: "off", properties: [], documentID: "active", filterDoc: "off"},
			layer: {type: "layer", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", filterLayer: "off", layerID: "selected"},
			path: {type: "path", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", filterLayer: "off", layerID: "selected", filterPath: "off", pathID: "selected"},
			channel: {type: "channel", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", filterLayer: "off", layerID: "selected", channelID: "selected", filterChannel: "off"},
			actions: {type: "actions", filterProp: "off", properties: [], actionID: "none", filterAction: "off", actionSetID: "none", filterActionSet: "off", commandIndex: "none", filterCommand: "off"},
			timeline: {type: "timeline", filterProp: "off", properties: []},
			animationFrameClass: {type: "animationFrameClass", filterProp: "off", properties: []},
			animationClass: {type: "animationClass", filterProp: "off", properties: []},
			historyState: {type: "historyState", filterProp: "off", properties: [], filterHistory: "off", historyID: "selected"},
			snapshotClass: {type: "snapshotClass", filterProp: "off", properties: [], filterSnapshot: "off", snapshotID: "selected"},
			guide: {type: "guide", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", guideID: "none", filterGuide: "off"},
			...{[selectedReferenceType]: refData},
		},
		settings: {searchTerm: null, listenerFilter: {type: "none", exclude: [], include: []}, notifierFilter: {type: "none", exclude: [], include: []}, autoUpdateInspector: false, activeDescriptors: [], accordionExpandedIDs: [], properties},
		inspector: {activeTab: "content", content: {viewType: "tree", search: "", treePath: [], autoExpandLevels: 0, expandedTree: []}, dom: {treePath: [], autoExpandLevels: 0, expandedTree: []}, difference: {viewType: "tree", treePath: [], autoExpandLevels: 0, expandedTree: []}},
	},
});

const subtypes = (container: HTMLElement): string[] =>
	within(container).queryAllByTestId("filter-row").map(el =>
		el.getAttribute("data-subtype") ?? "",
	);

describe("<Filters />", () => {
	it("renders the Type/main filter row first", () => {
		const refData = {type: "document", documentID: "active", filterDoc: "off", filterProp: "off", properties: []};
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("document", refData, [{type: "document", list: []}])});
		const list = subtypes(container);
		expect(list[0]).toBe("main");
	});

	it("renders document + property rows for type='document'", () => {
		const refData = {type: "document", documentID: "active", filterDoc: "off", properties: [], filterProp: "off"};
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("document", refData, [{type: "document", list: []}])});
		const list = subtypes(container);
		expect(list).toContain("documentID");
		expect(list).toContain("properties");
	});

	it("renders layer-related rows for type='layer'", () => {
		const refData = {type: "layer", documentID: "active", layerID: "selected", filterDoc: "off", filterLayer: "off", properties: [], filterProp: "off"};
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("layer", refData, [{type: "layer", list: []}])});
		const list = subtypes(container);
		expect(list).toEqual(expect.arrayContaining(["main", "documentID", "layerID", "properties"]));
	});

	it("renders the action chain for type='actions' with non-'none' IDs", () => {
		const refData = {type: "actions", actionSetID: 1, actionID: 2, commandIndex: 3, filterActionSet: "off", filterAction: "off", filterCommand: "off", properties: [], filterProp: "off"};
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("actions", refData, [{type: "actions", list: []}])});
		const list = subtypes(container);
		expect(list).toEqual(expect.arrayContaining(["actionSetID", "actionID", "commandIndex"]));
	});

	it("hides actionID & commandIndex when actionSetID is 'none'", () => {
		const refData = {type: "actions", actionSetID: "none", actionID: "none", commandIndex: "none", filterActionSet: "off", filterAction: "off", filterCommand: "off", properties: [], filterProp: "off"};
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("actions", refData, [{type: "actions", list: []}])});
		const list = subtypes(container);
		expect(list).toContain("actionSetID");
		expect(list).not.toContain("actionID");
		expect(list).not.toContain("commandIndex");
	});

	it("renders ListenerFilter when type='listener'", () => {
		const {getByTestId} = renderWithStore(<Filters />, {preloadedState: makeState("listener", {type: "listener"})});
		expect(getByTestId("listener-filter-stub")).toBeInTheDocument();
	});

	it("does NOT render Property row for ref types without properties", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("dispatcher", {type: "dispatcher"})});
		expect(subtypes(container)).not.toContain("properties");
	});
});
