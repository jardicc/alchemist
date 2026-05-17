/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, fireEvent, screen} from "@testing-library/react";
import {renderWithStore} from "../../../__tests__/renderWithStore";
import {configureStore} from "@reduxjs/toolkit";
import "@testing-library/jest-dom";

// Stub the icon helper to avoid pulling SVG modules.
jest.mock("../../helpers", () => ({
	getIcon: (_type: string) => "icon",
}));

// Stub shared icon components to harmless markers.
jest.mock("../../../shared/components/icons", () => ({
	IconLockLocked: () => null,
	IconPinDown: () => null,
}));

import {DescriptorItem} from "../DescriptorItem";

const makeState = (descriptors: any[] = []): any => ({
	inspector: {
		descriptors,
		selectedReferenceType: "layer",
		filterBySelectedReferenceType: "off",
		explicitlyVisibleTopCategories: [],
		targetReference: {layer: {type: "layer", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", filterLayer: "off", layerID: "selected"}},
		settings: {searchTerm: null, listenerFilter: {type: "none", exclude: [], include: []}, notifierFilter: {type: "none", exclude: [], include: []}, autoUpdateInspector: false, activeDescriptors: [], accordionExpandedIDs: [], groupDescriptors: "strict"},
		inspector: {activeTab: "content", content: {viewType: "tree", search: "", treePath: [], autoExpandLevels: 0, expandedTree: []}, dom: {treePath: [], autoExpandLevels: 0, expandedTree: []}, difference: {viewType: "tree", treePath: [], autoExpandLevels: 0, expandedTree: []}},
	},
});

const makeStore = (descriptors: any[] = []) => configureStore({
	reducer: (s: any = makeState(descriptors)) => s,
	preloadedState: makeState(descriptors),
	middleware: (g) => g({serializableCheck: false, immutableCheck: false, thunk: false}),
});

const baseDescriptor = (over: Partial<any> = {}): any => ({
	id: "id-1",
	selected: false,
	crc: 1,
	startTime: 0,
	endTime: 0,
	pinned: false,
	locked: false,
	renameMode: false,
	title: "My descriptor",
	originalReference: {type: "layer"},
	playAbleData: null,
	recordedData: null,
	descriptorSettings: {
		supportRawDataType: false,
		dialogOptions: null,
		modalBehavior: null,
		synchronousExecution: null,
	},
	...over,
});

const baseProps = (over: Partial<any> = {}): any => {
	const {descriptor: descriptorOver, ...rest} = over;
	return {
		descriptor: baseDescriptor(descriptorOver),
		autoSelected: [],
		onSelect: jest.fn(),
		onChangeName: jest.fn(),
		setRenameMode: jest.fn(),
		...rest,
	};
};

describe("<DescriptorItem />", () => {
	it("renders the descriptor title in normal mode", () => {
		renderWithStore(<DescriptorItem descriptor={baseDescriptor()} />, {preloadedState: makeState()});
		expect(screen.getByText("My descriptor")).toBeInTheDocument();
	});

	it("adds 'selected' class when descriptor.selected is true", () => {
		const {container} = renderWithStore(
			<DescriptorItem descriptor={baseDescriptor({selected: true})} />,
			{preloadedState: makeState()},
		);
		expect(container.querySelector(".wrap")?.className).toContain("selected");
	});

	it("adds 'autoSelected' class when descriptor id is in autoSelected[]", () => {
		// Provide the descriptor in state as unselected — it becomes the auto-active item.
		const desc = baseDescriptor();
		const {container} = renderWithStore(
			<DescriptorItem descriptor={desc} />,
			{preloadedState: makeState([desc])},
		);
		expect(container.querySelector(".wrap")?.className).toContain("autoSelected");
	});

	it("adds 'error' class when recordedData[0]._obj === 'error'", () => {
		const {container} = renderWithStore(
			<DescriptorItem descriptor={baseDescriptor({recordedData: [{_obj: "error"}]})} />,
			{preloadedState: makeState()},
		);
		expect(container.querySelector(".wrap")?.className).toContain("error");
	});

	it("renders the elapsed time when start/end are non-zero", () => {
		const {container} = renderWithStore(
			<DescriptorItem descriptor={baseDescriptor({startTime: 100, endTime: 250})} />,
			{preloadedState: makeState()},
		);
		expect(container.querySelector(".time")?.textContent).toBe("150 ms");
	});

	it("hides the time when startTime is 0", () => {
		const {container} = renderWithStore(<DescriptorItem descriptor={baseDescriptor()} />, {preloadedState: makeState()});
		expect(container.querySelector(".time")).toBeNull();
	});

	it("renders groupCount when > 1", () => {
		renderWithStore(
			<DescriptorItem descriptor={baseDescriptor({groupCount: 3})} />,
			{preloadedState: makeState()},
		);
		expect(screen.getByText("3×")).toBeInTheDocument();
	});

	it("dispatches selectDescriptor with 'replace' on plain click", () => {
		const store = makeStore();
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(<DescriptorItem descriptor={baseDescriptor()} />, {store});
		fireEvent.click(container.querySelector(".wrap")!);
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({operation: "replace", uuid: "id-1"})}),
		);
	});

	it("dispatches selectDescriptor with 'addContinuous' on shift+click", () => {
		const store = makeStore();
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(<DescriptorItem descriptor={baseDescriptor()} />, {store});
		fireEvent.click(container.querySelector(".wrap")!, {shiftKey: true});
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({operation: "addContinuous", uuid: "id-1"})}),
		);
	});

	it("dispatches selectDescriptor with 'add' on ctrl+click of an unselected item", () => {
		const store = makeStore();
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(<DescriptorItem descriptor={baseDescriptor()} />, {store});
		fireEvent.click(container.querySelector(".wrap")!, {ctrlKey: true});
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({operation: "add", uuid: "id-1"})}),
		);
	});

	it("dispatches selectDescriptor with 'subtract' on ctrl+click of a selected item", () => {
		const store = makeStore();
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(
			<DescriptorItem descriptor={baseDescriptor({selected: true})} />,
			{store},
		);
		fireEvent.click(container.querySelector(".wrap")!, {ctrlKey: true});
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({operation: "subtract", uuid: "id-1"})}),
		);
	});

	it("dispatches selectDescriptor with 'subtractContinuous' on shift+ctrl+click", () => {
		const store = makeStore();
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(<DescriptorItem descriptor={baseDescriptor()} />, {store});
		fireEvent.click(container.querySelector(".wrap")!, {shiftKey: true, ctrlKey: true});
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({operation: "subtractContinuous", uuid: "id-1"})}),
		);
	});

	it("renders the edit-mode UI when renameMode is true", () => {
		const {container} = renderWithStore(
			<DescriptorItem descriptor={baseDescriptor({renameMode: true})} />,
			{preloadedState: makeState()},
		);
		expect(container.querySelector(".editMode")).not.toBeNull();
		expect(screen.getByText("OK")).toBeInTheDocument();
		expect(screen.getByText("×")).toBeInTheDocument();
	});

	it("OK button dispatches renameDescriptor + setRenameMode(false)", () => {
		const store = makeStore();
		const dispatchSpy = jest.spyOn(store, "dispatch");
		renderWithStore(
			<DescriptorItem descriptor={baseDescriptor({renameMode: true, title: "tempTitle"})} />,
			{store},
		);
		fireEvent.click(screen.getByText("OK"));
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({uuid: "id-1", name: "tempTitle"})}),
		);
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({uuid: "id-1", on: false})}),
		);
	});

	it("× button dispatches setRenameMode(false) without renaming", () => {
		const store = makeStore();
		const dispatchSpy = jest.spyOn(store, "dispatch");
		renderWithStore(
			<DescriptorItem descriptor={baseDescriptor({renameMode: true})} />,
			{store},
		);
		fireEvent.click(screen.getByText("×"));
		const calls = dispatchSpy.mock.calls.map(c => c[0]) as any[];
		expect(calls.some(a => a?.payload?.name !== undefined)).toBe(false);
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: expect.objectContaining({uuid: "id-1", on: false})}),
		);
	});
});
