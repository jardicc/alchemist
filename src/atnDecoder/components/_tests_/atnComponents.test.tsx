/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";

import {ActionCommand} from "../ActionCommandContainer";
import {ActionItem} from "../ActionItemContainer";
import {ActionSet} from "../ActionSetContainer";
import {renderWithStore} from "../../../__tests__/renderWithStore";

// Stub selectors so the connected child containers don't require real state shape.
jest.mock("../../atnSelectors", () => ({
	getSelectedItemsCommand: () => [],
	getSelectedItemsAction: () => [],
	getSelectedItemsSet: () => [],
	getExpandedItemsAction: () => [],
	getExpandedItemsSet: () => [],
}));

const makeSet = (over: Partial<any> = {}): any => ({
	__uuid__: "set-1",
	version: 1,
	actionSetName: "Set A",
	expanded: false,
	actionItems: [],
	...over,
});

const makeAction = (over: Partial<any> = {}): any => ({
	__uuid__: "act-1",
	__uuidParentSet__: "set-1",
	fKeyIndex: 0, shiftKey: false, commandKey: false, colorIndex: 0,
	actionItemName: "Action A",
	expanded: false,
	commands: [],
	...over,
});

const makeCommand = (over: Partial<any> = {}): any => ({
	__uuid__: "cmd-1",
	__uuidParentAction__: "act-1",
	__uuidParentSet__: "set-1",
	expanded: false,
	enabled: true,
	showDialogs: false,
	dialogMode: 0,
	commandName: "My Command",
	commandName2: "",
	descriptor: {},
	...over,
});

describe("<ActionCommand />", () => {
	it("renders the (translated) command name", () => {
		const {container} = render(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
				selectedItems={[]}
				setSelectedItem={jest.fn()}
			/>,
		);
		expect(container.textContent).toContain("My Command");
	});

	it("does not get 'selected' class when uuid not selected", () => {
		const {container} = render(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
				selectedItems={[]}
				setSelectedItem={jest.fn()}
			/>,
		);
		expect(container.querySelector(".wrap")?.className).not.toContain("selected");
	});

	it("gets 'selected' class when matching uuid present", () => {
		const {container} = render(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
				selectedItems={[["set-1", "act-1", "cmd-1"]]}
				setSelectedItem={jest.fn()}
			/>,
		);
		expect(container.querySelector(".wrap")?.className).toContain("selected");
	});

	it("calls setSelectedItem with 'replace' on plain click", () => {
		const setSelectedItem = jest.fn();
		const {container} = render(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
				selectedItems={[]}
				setSelectedItem={setSelectedItem}
			/>,
		);
		fireEvent.click(container.querySelector(".wrap")!);
		expect(setSelectedItem).toHaveBeenCalledWith(["set-1", "act-1", "cmd-1"], "replace");
	});

	it("calls setSelectedItem with 'add' on ctrl-click of unselected item", () => {
		const setSelectedItem = jest.fn();
		const {container} = render(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
				selectedItems={[]}
				setSelectedItem={setSelectedItem}
			/>,
		);
		fireEvent.click(container.querySelector(".wrap")!, {ctrlKey: true});
		expect(setSelectedItem).toHaveBeenCalledWith(["set-1", "act-1", "cmd-1"], "add");
	});
});

describe("<ActionItem />", () => {
	it("renders item name and is collapsed by default", () => {
		const {container} = render(
			<ActionItem
				parentSet={makeSet()}
				actionItem={makeAction({commands: [makeCommand()]})}
				selectedItems={[]}
				expandedItems={[]}
				setSelectedItem={jest.fn()}
				setExpandedItem={jest.fn()}
			/>,
		);
		expect(container.textContent).toContain("Action A");
		// Children commands should not render when collapsed
		expect(container.textContent).not.toContain("My Command");
	});

	it("expands and renders child commands when uuid is present in expandedItems", () => {
		// Children are <ActionCommandContainer/> (Redux-connected) – wrap with a store.
		const preloadedState = {atn: {selectedItems: [], expandedItems: [["set-1", "act-1"]]}} as any;
		const {container} = renderWithStore(
			<ActionItem
				parentSet={makeSet()}
				actionItem={makeAction({commands: [makeCommand()]})}
				selectedItems={[]}
				expandedItems={[["set-1", "act-1"]]}
				setSelectedItem={jest.fn()}
				setExpandedItem={jest.fn()}
			/>,
			{preloadedState},
		);
		expect(container.textContent).toContain("My Command");
	});

	it("calls setExpandedItem on expand click", () => {
		const setExpandedItem = jest.fn();
		const {container} = render(
			<ActionItem
				parentSet={makeSet()}
				actionItem={makeAction({commands: [makeCommand()]})}
				selectedItems={[]}
				expandedItems={[]}
				setSelectedItem={jest.fn()}
				setExpandedItem={setExpandedItem}
			/>,
		);
		fireEvent.click(container.querySelector(".expand")!);
		expect(setExpandedItem).toHaveBeenCalledWith(["set-1", "act-1"], true);
	});
});

describe("<ActionSet />", () => {
	const setData = makeSet({
		actionItems: [makeAction({commands: [makeCommand()]})],
	});

	it("renders set name and is collapsed by default", () => {
		const {container} = render(
			<ActionSet
				actionSet={setData}
				selectedItems={[]}
				expandedItems={[]}
				setSelectedItem={jest.fn()}
				setExpandedItem={jest.fn()}
			/>,
		);
		expect(container.textContent).toContain("Set A");
		expect(container.textContent).not.toContain("Action A");
	});

	it("renders child action items when expanded", () => {
		const preloadedState = {atn: {selectedItems: [], expandedItems: [["set-1"]]}} as any;
		const {container} = renderWithStore(
			<ActionSet
				actionSet={setData}
				selectedItems={[]}
				expandedItems={[["set-1"]]}
				setSelectedItem={jest.fn()}
				setExpandedItem={jest.fn()}
			/>,
			{preloadedState},
		);
		expect(container.textContent).toContain("Action A");
	});

	it("flags 'selected' when matching uuid is in selectedItems", () => {
		const {container} = render(
			<ActionSet
				actionSet={setData}
				selectedItems={[["set-1"]]}
				expandedItems={[]}
				setSelectedItem={jest.fn()}
				setExpandedItem={jest.fn()}
			/>,
		);
		expect(container.querySelector(".wrap")?.className).toContain("selected");
	});

	it("calls setExpandedItem with recursive=true on ctrl/meta expand click", () => {
		const setExpandedItem = jest.fn();
		const {container} = render(
			<ActionSet
				actionSet={setData}
				selectedItems={[]}
				expandedItems={[]}
				setSelectedItem={jest.fn()}
				setExpandedItem={setExpandedItem}
			/>,
		);
		fireEvent.click(container.querySelector(".expand")!, {ctrlKey: true});
		expect(setExpandedItem).toHaveBeenCalledWith(["set-1"], true, true);
	});
});
