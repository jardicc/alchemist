/**
 * @jest-environment jsdom
 */
import React from "react";
import {fireEvent, act} from "@testing-library/react";
import "@testing-library/jest-dom";
import {configureStore} from "@reduxjs/toolkit";

// Stub heavy children so this test only exercises FilterRow's wiring.
jest.mock("../AccDrop", () => {
	const React = require("react");
	const AccDrop = (props: any) =>
		React.createElement(
			"div",
			{
				"data-testid": "acc-drop-stub",
				"data-id": props.id,
				"data-selected": JSON.stringify(props.selected),
				"data-items-len": (props.items ?? []).length,
			},
			[
				React.createElement(
					"button",
					{
						key: "select",
						"data-testid": "stub-select",
						onClick: (e: any) => props.onSelect("ignored", "the-value", e.toggleProperty),
					},
					"select",
				),
				React.createElement(
					"button",
					{
						key: "header",
						"data-testid": "stub-header",
						onClick: () => props.onHeaderClick?.(),
					},
					"header",
				),
				// expose headerPostFix so tests can interact with the FilterButton stub
				React.createElement("div", {key: "pf", "data-testid": "stub-postfix"}, props.headerPostFix),
			],
		);
	return {AccDrop};
});

jest.mock("../FilterButton", () => {
	const React = require("react");
	const FilterButton = (props: any) =>
		React.createElement(
			"button",
			{
				"data-testid": "filter-button-stub",
				"data-state": props.state,
				"data-subtype": props.subtype,
				onClick: (e: any) => props.onClick(props.subtype, "off", e),
			},
			"FB",
		);
	return {FilterButton};
});

import {FilterRow} from "../FilterRow";
import {renderWithStore} from "../../../__tests__/renderWithStore";
import {setFilterState as setFilterState} from "../../inspectorSlice";

const layerState = {
	inspector: {
		descriptors: [],
		selectedReferenceType: "layer",
		filterBySelectedReferenceType: "off",
		explicitlyVisibleTopCategories: [],
		targetReference: {layer: {type: "layer", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", filterLayer: "off", layerID: "selected"}},
		settings: {searchTerm: null, listenerFilter: {type: "none", exclude: [], include: []}, notifierFilter: {type: "none", exclude: [], include: []}, autoUpdateInspector: false, activeDescriptors: [], accordionExpandedIDs: []},
		inspector: {activeTab: "content", content: {viewType: "tree", search: "", treePath: [], autoExpandLevels: 0, expandedTree: []}, dom: {treePath: [], autoExpandLevels: 0, expandedTree: []}, difference: {viewType: "tree", treePath: [], autoExpandLevels: 0, expandedTree: []}},
	},
} as any;

const baseProps = (overrides: Partial<any> = {}) => ({
	subtype: "main",
	header: "Type:",
	value: "layer",
	filterBy: "off",
	activeRef: {type: "layer"},
	items: [{label: "A", value: "a"}, {label: "B", value: "b"}],
	onSelect: jest.fn(),
	onSetFilter: jest.fn(),
	...overrides,
});

describe("<FilterRow />", () => {
	it("renders an AccDrop using the subtype as id", () => {
		const {getByTestId} = renderWithStore(<FilterRow {...(baseProps() as any)} />, {preloadedState: layerState});
		expect(getByTestId("acc-drop-stub").getAttribute("data-id")).toBe("main");
	});

	it("normalizes a single value into an array for `selected`", () => {
		const {getByTestId} = renderWithStore(<FilterRow {...(baseProps({value: "x"}) as any)} />, {preloadedState: layerState});
		expect(getByTestId("acc-drop-stub").getAttribute("data-selected")).toBe(JSON.stringify(["x"]));
	});

	it("passes through array values unchanged", () => {
		const {getByTestId} = renderWithStore(
			<FilterRow {...(baseProps({value: ["a", "b"]}) as any)} />,
			{preloadedState: layerState},
		);
		expect(getByTestId("acc-drop-stub").getAttribute("data-selected")).toBe(JSON.stringify(["a", "b"]));
	});

	it("forwards onSelect to the parent (without the AccDrop id)", () => {
		const onSelect = jest.fn();
		const {getByTestId} = renderWithStore(<FilterRow {...(baseProps({onSelect}) as any)} />, {preloadedState: layerState});
		fireEvent.click(getByTestId("stub-select"));
		// (value, !!toggleProperty) -> (the-value, false) here since toggleProperty undefined
		expect(onSelect).toHaveBeenCalledWith("the-value", false);
	});

	it("calls setFilterState dispatch on FilterButton click using activeRef.type and subtype", () => {
		const store = configureStore({
			reducer: (s: any = layerState) => s,
			preloadedState: layerState,
			middleware: (g) => g({serializableCheck: false, immutableCheck: false, thunk: false}),
		});
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {getByTestId} = renderWithStore(
			<FilterRow {...(baseProps({subtype: "documentID"}) as any)} />,
			{store},
		);
		fireEvent.click(getByTestId("filter-button-stub"));
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({type: "layer", subType: "documentID", state: "off"})}),
		);
	});

	it("uses prop items directly when provided (no internal list)", () => {
		const {getByTestId} = renderWithStore(<FilterRow {...(baseProps() as any)} />, {preloadedState: layerState});
		expect(getByTestId("acc-drop-stub").getAttribute("data-items-len")).toBe("2");
	});

	it("appends loaded items to initialItems when header is clicked + onUpdateList exists", async () => {
		const onUpdateList = jest.fn().mockResolvedValue([{label: "C", value: "c"}]);
		const props = baseProps({
			items: undefined,
			initialItems: [{label: "A", value: "a"}],
			onUpdateList,
		});
		const {getByTestId} = renderWithStore(<FilterRow {...(props as any)} />, {preloadedState: layerState});

		await act(async () => {
			fireEvent.click(getByTestId("stub-header"));
			await Promise.resolve();
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(onUpdateList).toHaveBeenCalled();
		// initial 1 + loaded 1 = 2 items in the AccDrop list
		expect(getByTestId("acc-drop-stub").getAttribute("data-items-len")).toBe("2");
	});

	it("does nothing on header click when onUpdateList is missing", async () => {
		const {getByTestId} = renderWithStore(<FilterRow {...(baseProps() as any)} />, {preloadedState: layerState});
		await fireEvent.click(getByTestId("stub-header"));
		// Still 2 items (the original ones), no throw
		expect(getByTestId("acc-drop-stub").getAttribute("data-items-len")).toBe("2");
	});
});
