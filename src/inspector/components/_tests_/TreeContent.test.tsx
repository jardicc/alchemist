/**
 * @jest-environment jsdom
 */
import React from "react";
import {screen, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";
import {renderWithStore} from "../../../__tests__/renderWithStore";
import {configureStore} from "@reduxjs/toolkit";

// Stub heavy children — we are testing TreeContent's wiring, not the trees.
jest.mock("../react-json-tree-2", () => ({
	JSONTree: (props: any) =>
		React.createElement("div", {
			"data-testid": "json-tree",
			"data-data": JSON.stringify(props.data),
		}),
}));

jest.mock("../TreePath", () => ({
	TreePath: (props: any) =>
		React.createElement("div", {
			"data-testid": "tree-path",
			"data-path": JSON.stringify(props.path),
			"data-levels": String(props.autoExpandLevels),
			"data-hide-levels": String(!!props.hideLevels),
		}),
}));

import {TreeContent} from "../TreeContent";

const makeState = (contentOverride?: any, viewType = "tree", search = ""): any => ({
	inspector: {
		descriptors: contentOverride !== null && contentOverride !== undefined
			? [{id: "d1", selected: true, crc: 0, startTime: 0, endTime: 0, pinned: false, locked: false, renameMode: false, title: "d1", originalReference: {type: "layer"}, playAbleData: null, recordedData: contentOverride, descriptorSettings: {}}]
			: [],
		selectedReferenceType: "layer",
		filterBySelectedReferenceType: "off",
		explicitlyVisibleTopCategories: [],
		targetReference: {layer: {type: "layer", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", filterLayer: "off", layerID: "selected"}},
		settings: {searchTerm: null, listenerFilter: {type: "none", exclude: [], include: []}, notifierFilter: {type: "none", exclude: [], include: []}, autoUpdateInspector: false, activeDescriptors: [], accordionExpandedIDs: []},
		inspector: {
			activeTab: "content",
			content: {viewType, search, treePath: [], autoExpandLevels: 1, expandedTree: []},
			dom: {treePath: [], autoExpandLevels: 0, expandedTree: []},
			difference: {viewType: "tree", treePath: [], autoExpandLevels: 0, expandedTree: []},
		},
	},
});

describe("<TreeContent />", () => {
	it("renders the JSONTree with the content data when in 'tree' view", () => {
		renderWithStore(<TreeContent />, {preloadedState: makeState({hello: "world"})});
		const tree = screen.getByTestId("json-tree");
		expect(tree).toBeInTheDocument();
		expect(tree.getAttribute("data-data")).toBe(JSON.stringify({hello: "world"}));
	});

	it("renders the TreePath with the current path", () => {
		renderWithStore(<TreeContent />, {preloadedState: makeState({hello: "world"})});
		const tp = screen.getAllByTestId("tree-path")[0];
		expect(tp.getAttribute("data-path")).toBe(JSON.stringify([]));
	});

	it("renders the missing-content message when content is null", () => {
		renderWithStore(<TreeContent />, {preloadedState: makeState(null)});
		expect(
			screen.getByText(/Content is missing/i),
		).toBeInTheDocument();
		// JSONTree should not render in that case
		expect(screen.queryByTestId("json-tree")).not.toBeInTheDocument();
	});

	it("propagates the search field input via onSetSearch", () => {
		const preloadedState = makeState({hello: "world"});
		const store = configureStore({
			reducer: (s: any = preloadedState) => s,
			preloadedState,
			middleware: (g) => g({serializableCheck: false, immutableCheck: false, thunk: false}),
		});
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(<TreeContent />, {store});
		const search = container.querySelector(".filterContent") as HTMLInputElement;
		expect(search).not.toBeNull();
		fireEvent.input(search, {target: {value: "needle"}});
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: "needle"}),
		);
	});

	it("hides the level slider on the Raw tab's TreePath", () => {
		renderWithStore(<TreeContent />, {preloadedState: makeState({hello: "world"}, "raw")});
		const tp = screen.getByTestId("tree-path");
		expect(tp.getAttribute("data-hide-levels")).toBe("true");
	});
});
