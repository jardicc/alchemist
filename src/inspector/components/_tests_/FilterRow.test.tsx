/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, fireEvent, act} from "@testing-library/react";
import "@testing-library/jest-dom";

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
		const {getByTestId} = render(<FilterRow {...(baseProps() as any)} />);
		expect(getByTestId("acc-drop-stub").getAttribute("data-id")).toBe("main");
	});

	it("normalizes a single value into an array for `selected`", () => {
		const {getByTestId} = render(<FilterRow {...(baseProps({value: "x"}) as any)} />);
		expect(getByTestId("acc-drop-stub").getAttribute("data-selected")).toBe(JSON.stringify(["x"]));
	});

	it("passes through array values unchanged", () => {
		const {getByTestId} = render(
			<FilterRow {...(baseProps({value: ["a", "b"]}) as any)} />,
		);
		expect(getByTestId("acc-drop-stub").getAttribute("data-selected")).toBe(JSON.stringify(["a", "b"]));
	});

	it("forwards onSelect to the parent (without the AccDrop id)", () => {
		const onSelect = jest.fn();
		const {getByTestId} = render(<FilterRow {...(baseProps({onSelect}) as any)} />);
		fireEvent.click(getByTestId("stub-select"));
		// (value, !!toggleProperty) -> (the-value, false) here since toggleProperty undefined
		expect(onSelect).toHaveBeenCalledWith("the-value", false);
	});

	it("calls onSetFilter on FilterButton click using activeRef.type and subtype", () => {
		const onSetFilter = jest.fn();
		const {getByTestId} = render(
			<FilterRow {...(baseProps({onSetFilter, subtype: "documentID"}) as any)} />,
		);
		fireEvent.click(getByTestId("filter-button-stub"));
		expect(onSetFilter).toHaveBeenCalledWith("layer", "documentID", "off");
	});

	it("uses prop items directly when provided (no internal list)", () => {
		const {getByTestId} = render(<FilterRow {...(baseProps() as any)} />);
		expect(getByTestId("acc-drop-stub").getAttribute("data-items-len")).toBe("2");
	});

	it("appends loaded items to initialItems when header is clicked + onUpdateList exists", async () => {
		const onUpdateList = jest.fn().mockResolvedValue([{label: "C", value: "c"}]);
		const props = baseProps({
			items: undefined,
			initialItems: [{label: "A", value: "a"}],
			onUpdateList,
		});
		const {getByTestId} = render(<FilterRow {...(props as any)} />);

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
		const {getByTestId} = render(<FilterRow {...(baseProps() as any)} />);
		await fireEvent.click(getByTestId("stub-header"));
		// Still 2 items (the original ones), no throw
		expect(getByTestId("acc-drop-stub").getAttribute("data-items-len")).toBe("2");
	});
});
