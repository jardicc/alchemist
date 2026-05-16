/**
 * @jest-environment jsdom
 */
import React from "react";
import {fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";

import {ActionCommand} from "../ActionCommandContainer";
import {ActionItem} from "../ActionItemContainer";
import {ActionSet} from "../ActionSetContainer";
import {renderWithStore} from "../../../__tests__/renderWithStore";
import {configureStore} from "@reduxjs/toolkit";

const makeStore = (preloadedState: any = {}) => configureStore({
	reducer: (s: any = preloadedState) => s,
	preloadedState,
	middleware: (g) => g({serializableCheck: false, immutableCheck: false, thunk: false}),
});

// Stub selectors so the connected child containers don't require real state shape.
jest.mock("../../atnSelectors", () => ({
	getSelectedItemsCommand: jest.fn().mockReturnValue([]),
	getSelectedItemsAction: jest.fn().mockReturnValue([]),
	getSelectedItemsSet: jest.fn().mockReturnValue([]),
	getExpandedItemsAction: jest.fn().mockReturnValue([]),
	getExpandedItemsSet: jest.fn().mockReturnValue([]),
}));

import {
	getSelectedItemsCommand, getSelectedItemsSet, getSelectedItemsAction,
	getExpandedItemsAction, getExpandedItemsSet,
} from "../../atnSelectors";

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

const atnState: any = {atn: {selectedItems: [], expandedItems: []}};

describe("<ActionCommand />", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(getSelectedItemsCommand as jest.Mock).mockReturnValue([]);
		(getSelectedItemsAction as jest.Mock).mockReturnValue([]);
		(getSelectedItemsSet as jest.Mock).mockReturnValue([]);
		(getExpandedItemsAction as jest.Mock).mockReturnValue([]);
		(getExpandedItemsSet as jest.Mock).mockReturnValue([]);
	});

	it("renders the (translated) command name", () => {
		const {container} = renderWithStore(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
			/>,
			{preloadedState: atnState},
		);
		expect(container.textContent).toContain("My Command");
	});

	it("does not get 'selected' class when uuid not selected", () => {
		const {container} = renderWithStore(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
			/>,
			{preloadedState: atnState},
		);
		expect(container.querySelector(".wrap")?.className).not.toContain("selected");
	});

	it("gets 'selected' class when matching uuid present", () => {
		(getSelectedItemsCommand as jest.Mock).mockReturnValue([["set-1", "act-1", "cmd-1"]]);
		const {container} = renderWithStore(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
			/>,
			{preloadedState: atnState},
		);
		expect(container.querySelector(".wrap")?.className).toContain("selected");
	});

	it("dispatches setSelectAction with 'replace' on plain click", () => {
		const store = makeStore(atnState);
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
			/>,
			{store},
		);
		fireEvent.click(container.querySelector(".wrap")!);
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({operation: "replace"})}),
		);
	});

	it("dispatches setSelectAction with 'add' on ctrl-click of unselected item", () => {
		const store = makeStore(atnState);
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(
			<ActionCommand
				parentSet={makeSet()}
				parentAction={makeAction()}
				actionCommand={makeCommand()}
			/>,
			{store},
		);
		fireEvent.click(container.querySelector(".wrap")!, {ctrlKey: true});
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({operation: "add"})}),
		);
	});
});

describe("<ActionItem />", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(getSelectedItemsCommand as jest.Mock).mockReturnValue([]);
		(getSelectedItemsAction as jest.Mock).mockReturnValue([]);
		(getSelectedItemsSet as jest.Mock).mockReturnValue([]);
		(getExpandedItemsAction as jest.Mock).mockReturnValue([]);
		(getExpandedItemsSet as jest.Mock).mockReturnValue([]);
	});

	it("renders item name and is collapsed by default", () => {
		const {container} = renderWithStore(
			<ActionItem
				parent={makeSet()}
				actionItem={makeAction({commands: [makeCommand()]})}
			/>,
			{preloadedState: atnState},
		);
		expect(container.textContent).toContain("Action A");
		// Children commands should not render when collapsed
		expect(container.textContent).not.toContain("My Command");
	});

	it("expands and renders child commands when uuid is present in expandedItems", () => {
		(getExpandedItemsAction as jest.Mock).mockReturnValue([["set-1", "act-1"]]);
		const {container} = renderWithStore(
			<ActionItem
				parent={makeSet()}
				actionItem={makeAction({commands: [makeCommand()]})}
			/>,
			{preloadedState: atnState},
		);
		expect(container.textContent).toContain("My Command");
	});

	it("dispatches expandAction on expand click", () => {
		const store = makeStore(atnState);
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(
			<ActionItem
				parent={makeSet()}
				actionItem={makeAction({commands: [makeCommand()]})}
			/>,
			{store},
		);
		fireEvent.click(container.querySelector(".expand")!);
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({expand: true})}),
		);
	});
});

describe("<ActionSet />", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(getSelectedItemsCommand as jest.Mock).mockReturnValue([]);
		(getSelectedItemsAction as jest.Mock).mockReturnValue([]);
		(getSelectedItemsSet as jest.Mock).mockReturnValue([]);
		(getExpandedItemsAction as jest.Mock).mockReturnValue([]);
		(getExpandedItemsSet as jest.Mock).mockReturnValue([]);
	});

	const setData = makeSet({
		actionItems: [makeAction({commands: [makeCommand()]})],
	});

	it("renders set name and is collapsed by default", () => {
		const {container} = renderWithStore(
			<ActionSet actionSet={setData} />,
			{preloadedState: atnState},
		);
		expect(container.textContent).toContain("Set A");
		expect(container.textContent).not.toContain("Action A");
	});

	it("renders child action items when expanded", () => {
		(getExpandedItemsSet as jest.Mock).mockReturnValue([["set-1"]]);
		const {container} = renderWithStore(
			<ActionSet actionSet={setData} />,
			{preloadedState: atnState},
		);
		expect(container.textContent).toContain("Action A");
	});

	it("flags 'selected' when matching uuid is in selectedItems", () => {
		(getSelectedItemsSet as jest.Mock).mockReturnValue([["set-1"]]);
		const {container} = renderWithStore(
			<ActionSet actionSet={setData} />,
			{preloadedState: atnState},
		);
		expect(container.querySelector(".wrap")?.className).toContain("selected");
	});

	it("dispatches expandAction with recursive=true on ctrl/meta expand click", () => {
		const store = makeStore(atnState);
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(
			<ActionSet actionSet={setData} />,
			{store},
		);
		fireEvent.click(container.querySelector(".expand")!, {ctrlKey: true});
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({recursive: true})}),
		);
	});
});
