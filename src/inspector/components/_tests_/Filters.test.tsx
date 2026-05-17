/**
 * @jest-environment jsdom
 */
import React from "react";
import {within} from "@testing-library/react";
import "@testing-library/jest-dom";

// Stub children so <Filters /> can be rendered in isolation.
// Each FilterRow stub exposes data-testid + data-subtype so tests can
// assert which rows appear without depending on AccDrop internals.
jest.mock("../FilterRow", () => {
	const React = require("react");
	const FilterRow = (props: any) =>
		React.createElement("div", {
			"data-testid": "filter-row",
			"data-subtype": props.subtype,
		});
	return {FilterRow};
});

jest.mock("../ListenerFilter", () => {
	const React = require("react");
	return {
		ListenerFilter: () =>
			React.createElement("div", {"data-testid": "listener-filter"}),
	};
});

jest.mock("../ItemVisibilityButton", () => ({ItemVisibilityButtonWrap: () => null}));

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
import {getInitialState} from "../../inspInitialState";

/**
 * Build a Redux preloaded-state for <Filters /> by taking the real initial
 * state as the base and shallow-merging only the fields relevant to the test.
 * This ensures the state shape always matches the actual store structure.
 */
const makeState = (selectedReferenceType: string, refOverride: Record<string, unknown> = {}): any => {
	const base = getInitialState();
	return {
		inspector: {
			...base,
			selectedReferenceType: selectedReferenceType as any,
			targetReference: {
				...base.targetReference,
				[selectedReferenceType]: {
					...base.targetReference[selectedReferenceType as keyof typeof base.targetReference],
					...refOverride,
				},
			},
		},
	};
};

/** Ordered list of data-subtype values for every rendered filter-row. */
const getSubtypes = (container: HTMLElement): string[] =>
	within(container).queryAllByTestId("filter-row").map(el => el.getAttribute("data-subtype") ?? "");

// ─────────────────────────────────────────────────────────────────────────────

describe("<Filters /> – filter row visibility", () => {

	// ── "main" row is always first ────────────────────────────────────────────
	it("always renders the 'main' Type row as the first item", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("document")});
		expect(getSubtypes(container)[0]).toBe("main");
	});

	// ── showDocument ──────────────────────────────────────────────────────────
	it.each(["document", "layer", "channel", "path", "guide"])(
		"type='%s': shows the documentID row",
		(type) => {
			const {container} = renderWithStore(<Filters />, {preloadedState: makeState(type)});
			expect(getSubtypes(container)).toContain("documentID");
		},
	);

	it.each(["historyState", "snapshotClass", "actions"])(
		"type='%s': does NOT show the documentID row",
		(type) => {
			const {container} = renderWithStore(<Filters />, {preloadedState: makeState(type)});
			expect(getSubtypes(container)).not.toContain("documentID");
		},
	);

	// ── showLayer ─────────────────────────────────────────────────────────────
	it("type='layer': shows the layerID row", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("layer")});
		expect(getSubtypes(container)).toContain("layerID");
	});

	it.each(["mask", "filterMask"] as const)(
		"type='channel' channelID='%s': shows the layerID row",
		(channelID) => {
			const {container} = renderWithStore(<Filters />, {preloadedState: makeState("channel", {channelID})});
			expect(getSubtypes(container)).toContain("layerID");
		},
	);

	it.each(["selected", "all", "composite", 1] as const)(
		"type='channel' channelID='%s': does NOT show the layerID row",
		(channelID) => {
			const {container} = renderWithStore(<Filters />, {preloadedState: makeState("channel", {channelID})});
			expect(getSubtypes(container)).not.toContain("layerID");
		},
	);

	it("type='path' pathID='vectorMask': shows the layerID row", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("path", {pathID: "vectorMask"})});
		expect(getSubtypes(container)).toContain("layerID");
	});

	it.each(["selected", "all", "workPath", 1] as const)(
		"type='path' pathID='%s': does NOT show the layerID row",
		(pathID) => {
			const {container} = renderWithStore(<Filters />, {preloadedState: makeState("path", {pathID})});
			expect(getSubtypes(container)).not.toContain("layerID");
		},
	);

	// ── Type-specific rows ────────────────────────────────────────────────────
	it("type='historyState': shows historyID row", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("historyState")});
		expect(getSubtypes(container)).toContain("historyID");
	});

	it("type='snapshotClass': shows snapshotID row", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("snapshotClass")});
		expect(getSubtypes(container)).toContain("snapshotID");
	});

	it("type='guide': shows guideID row", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("guide")});
		expect(getSubtypes(container)).toContain("guideID");
	});

	it("type='channel': shows channelID row", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("channel")});
		expect(getSubtypes(container)).toContain("channelID");
	});

	it("type='path': shows pathID row", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("path")});
		expect(getSubtypes(container)).toContain("pathID");
	});

	// ── ListenerFilter ────────────────────────────────────────────────────────
	it.each(["listener", "notifier"] as const)(
		"type='%s': renders ListenerFilter",
		(type) => {
			const {getByTestId} = renderWithStore(<Filters />, {preloadedState: makeState(type)});
			expect(getByTestId("listener-filter")).toBeInTheDocument();
		},
	);

	it("type='layer': does NOT render ListenerFilter", () => {
		const {queryByTestId} = renderWithStore(<Filters />, {preloadedState: makeState("layer")});
		expect(queryByTestId("listener-filter")).not.toBeInTheDocument();
	});

	// ── showProperties ────────────────────────────────────────────────────────
	it.each(["generator", "listener", "dispatcher", "notifier", "replies"])(
		"type='%s': does NOT show the properties row",
		(type) => {
			const {container} = renderWithStore(<Filters />, {preloadedState: makeState(type)});
			expect(getSubtypes(container)).not.toContain("properties");
		},
	);

	it.each(["application", "document", "layer", "timeline"])(
		"type='%s': shows the properties row",
		(type) => {
			const {container} = renderWithStore(<Filters />, {preloadedState: makeState(type)});
			expect(getSubtypes(container)).toContain("properties");
		},
	);

	// ── Actions cascade ───────────────────────────────────────────────────────
	it("actions actionSetID='none': only actionSetID shown (no actionID, no commandIndex)", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("actions")});
		const list = getSubtypes(container);
		expect(list).toContain("actionSetID");
		expect(list).not.toContain("actionID");
		expect(list).not.toContain("commandIndex");
	});

	it("actions actionSetID set, actionID='none': shows actionSetID + actionID (no commandIndex)", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("actions", {actionSetID: 1})});
		const list = getSubtypes(container);
		expect(list).toContain("actionSetID");
		expect(list).toContain("actionID");
		expect(list).not.toContain("commandIndex");
	});

	it("actions with actionSetID + actionID both set: shows full chain (actionSetID, actionID, commandIndex)", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("actions", {actionSetID: 1, actionID: 2})});
		expect(getSubtypes(container)).toEqual(expect.arrayContaining(["actionSetID", "actionID", "commandIndex"]));
	});

	// ── Complete ordered row sets ─────────────────────────────────────────────
	it("type='guide': renders exactly [main, documentID, guideID, properties]", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("guide")});
		expect(getSubtypes(container)).toEqual(["main", "documentID", "guideID", "properties"]);
	});

	it("type='historyState': renders exactly [main, historyID, properties]", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("historyState")});
		expect(getSubtypes(container)).toEqual(["main", "historyID", "properties"]);
	});

	it("type='snapshotClass': renders exactly [main, snapshotID, properties]", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("snapshotClass")});
		expect(getSubtypes(container)).toEqual(["main", "snapshotID", "properties"]);
	});

	it("type='channel' channelID='mask': renders [main, documentID, channelID, layerID, properties]", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("channel", {channelID: "mask"})});
		expect(getSubtypes(container)).toEqual(["main", "documentID", "channelID", "layerID", "properties"]);
	});

	it("type='channel' channelID='selected': renders [main, documentID, channelID, properties] (no layerID)", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("channel")});
		expect(getSubtypes(container)).toEqual(["main", "documentID", "channelID", "properties"]);
	});

	it("type='path' pathID='vectorMask': renders [main, documentID, pathID, layerID, properties]", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("path", {pathID: "vectorMask"})});
		expect(getSubtypes(container)).toEqual(["main", "documentID", "pathID", "layerID", "properties"]);
	});

	it("type='path' pathID='selected': renders [main, documentID, pathID, properties] (no layerID)", () => {
		const {container} = renderWithStore(<Filters />, {preloadedState: makeState("path")});
		expect(getSubtypes(container)).toEqual(["main", "documentID", "pathID", "properties"]);
	});
});
