/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, fireEvent, screen} from "@testing-library/react";
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

import {DescriptorItem} from "../DescriptorItemContainer";

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
		render(<DescriptorItem {...baseProps()} />);
		expect(screen.getByText("My descriptor")).toBeInTheDocument();
	});

	it("adds 'selected' class when descriptor.selected is true", () => {
		const {container} = render(
			<DescriptorItem {...baseProps({descriptor: {selected: true}})} />,
		);
		expect(container.querySelector(".wrap")?.className).toContain("selected");
	});

	it("adds 'autoSelected' class when descriptor id is in autoSelected[]", () => {
		const {container} = render(
			<DescriptorItem {...baseProps({autoSelected: ["id-1"]})} />,
		);
		expect(container.querySelector(".wrap")?.className).toContain("autoSelected");
	});

	it("adds 'error' class when recordedData[0]._obj === 'error'", () => {
		const {container} = render(
			<DescriptorItem
				{...baseProps({descriptor: {recordedData: [{_obj: "error"}]}})}
			/>,
		);
		expect(container.querySelector(".wrap")?.className).toContain("error");
	});

	it("renders the elapsed time when start/end are non-zero", () => {
		const {container} = render(
			<DescriptorItem {...baseProps({descriptor: {startTime: 100, endTime: 250}})} />,
		);
		expect(container.querySelector(".time")?.textContent).toBe("150 ms");
	});

	it("hides the time when startTime is 0", () => {
		const {container} = render(<DescriptorItem {...baseProps()} />);
		expect(container.querySelector(".time")).toBeNull();
	});

	it("renders groupCount when > 1", () => {
		render(
			<DescriptorItem {...baseProps({descriptor: {groupCount: 3}})} />,
		);
		expect(screen.getByText("3×")).toBeInTheDocument();
	});

	it("calls onSelect with 'replace' on plain click", () => {
		const onSelect = jest.fn();
		const {container} = render(<DescriptorItem {...baseProps({onSelect})} />);
		fireEvent.click(container.querySelector(".wrap")!);
		expect(onSelect).toHaveBeenCalledWith("id-1", "replace", 1);
	});

	it("calls onSelect with 'addContinuous' on shift+click", () => {
		const onSelect = jest.fn();
		const {container} = render(<DescriptorItem {...baseProps({onSelect})} />);
		fireEvent.click(container.querySelector(".wrap")!, {shiftKey: true});
		expect(onSelect).toHaveBeenCalledWith("id-1", "addContinuous", 1);
	});

	it("calls onSelect with 'add' on ctrl+click of an unselected item", () => {
		const onSelect = jest.fn();
		const {container} = render(<DescriptorItem {...baseProps({onSelect})} />);
		fireEvent.click(container.querySelector(".wrap")!, {ctrlKey: true});
		expect(onSelect).toHaveBeenCalledWith("id-1", "add", 1);
	});

	it("calls onSelect with 'subtract' on ctrl+click of a selected item", () => {
		const onSelect = jest.fn();
		const {container} = render(
			<DescriptorItem {...baseProps({onSelect, descriptor: {selected: true}})} />,
		);
		fireEvent.click(container.querySelector(".wrap")!, {ctrlKey: true});
		expect(onSelect).toHaveBeenCalledWith("id-1", "subtract", 1);
	});

	it("calls onSelect with 'subtractContinuous' on shift+ctrl+click", () => {
		const onSelect = jest.fn();
		const {container} = render(<DescriptorItem {...baseProps({onSelect})} />);
		fireEvent.click(container.querySelector(".wrap")!, {shiftKey: true, ctrlKey: true});
		expect(onSelect).toHaveBeenCalledWith("id-1", "subtractContinuous", 1);
	});

	it("renders the edit-mode UI when renameMode is true", () => {
		const {container} = render(
			<DescriptorItem {...baseProps({descriptor: {renameMode: true}})} />,
		);
		expect(container.querySelector(".editMode")).not.toBeNull();
		expect(screen.getByText("OK")).toBeInTheDocument();
		expect(screen.getByText("×")).toBeInTheDocument();
	});

	it("OK button calls onChangeName + setRenameMode(false)", () => {
		const onChangeName = jest.fn();
		const setRenameMode = jest.fn();
		render(
			<DescriptorItem
				{...baseProps({
					onChangeName,
					setRenameMode,
					descriptor: {renameMode: true, title: "tempTitle"},
				})}
			/>,
		);
		fireEvent.click(screen.getByText("OK"));
		expect(onChangeName).toHaveBeenCalledWith("id-1", "tempTitle");
		expect(setRenameMode).toHaveBeenCalledWith("id-1", false);
	});

	it("× button cancels rename mode without renaming", () => {
		const onChangeName = jest.fn();
		const setRenameMode = jest.fn();
		render(
			<DescriptorItem
				{...baseProps({
					onChangeName,
					setRenameMode,
					descriptor: {renameMode: true},
				})}
			/>,
		);
		fireEvent.click(screen.getByText("×"));
		expect(onChangeName).not.toHaveBeenCalled();
		expect(setRenameMode).toHaveBeenCalledWith("id-1", false);
	});
});
