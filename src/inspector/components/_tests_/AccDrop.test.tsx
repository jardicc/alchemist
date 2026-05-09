/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";

import {AccDrop, IAccDropProps} from "../AccDrop";

const baseProps = (over: Partial<IAccDropProps> = {}): IAccDropProps => ({
	id: "drop-1",
	header: "Header",
	items: [
		{label: "Alpha", value: "a"},
		{label: "Beta", value: "b"},
	] as any,
	selected: [],
	onSelect: jest.fn(),
	...over,
});

describe("<AccDrop />", () => {
	it("renders the header label", () => {
		render(<AccDrop {...baseProps({header: "MyHeader"})} />);
		expect(screen.getByText("MyHeader")).toBeInTheDocument();
	});

	it("shows 'n/a' label when nothing is selected", () => {
		render(<AccDrop {...baseProps({selected: []})} />);
		expect(screen.getByText("n/a")).toBeInTheDocument();
	});

	it("shows the single selected item label", () => {
		render(<AccDrop {...baseProps({selected: ["a"]})} />);
		expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);
	});

	it("shows '+(N-1)' suffix when multiple items selected", () => {
		render(<AccDrop {...baseProps({selected: ["a", "b"]})} />);
		expect(screen.getByText(/Alpha\s*\+\(1\)/)).toBeInTheDocument();
	});

	it("renders all items in the popover content", () => {
		const {container} = render(<AccDrop {...baseProps()} />);
		const labels = container.querySelectorAll(".item .label span");
		expect(Array.from(labels as unknown as ArrayLike<Element>).map(n => n.textContent)).toEqual(["Alpha", "Beta"]);
	});

	it("calls onSelect when an item is clicked (no modifier)", () => {
		const onSelect = jest.fn();
		const {container} = render(<AccDrop {...baseProps({onSelect})} />);
		const items = container.querySelectorAll(".item");
		fireEvent.click(items[1]);
		expect(onSelect).toHaveBeenCalledWith("drop-1", "b");
	});

	it("passes toggle=true on ctrl/meta click", () => {
		const onSelect = jest.fn();
		const {container} = render(<AccDrop {...baseProps({onSelect})} />);
		const items = container.querySelectorAll(".item");
		fireEvent.click(items[0], {ctrlKey: true});
		expect(onSelect).toHaveBeenCalledWith("drop-1", "a", true);
	});

	it("renders an item group header when given a group", () => {
		const items = [
			{group: "g1", groupLabel: "Group One", data: [{label: "X", value: "x"}]},
		];
		const {container} = render(<AccDrop {...baseProps({items: items as any})} />);
		expect(screen.getByText("Group One")).toBeInTheDocument();
		expect(container.querySelector(".groupWrapper")).not.toBeNull();
	});

	it("renders headerPostFix element", () => {
		render(<AccDrop {...baseProps({headerPostFix: <div data-testid="postfix">PF</div>})} />);
		expect(screen.getByTestId("postfix")).toBeInTheDocument();
	});

	it("renders ItemPostFix component for each item when provided", () => {
		const PF: React.FC<{value: string}> = ({value}) => (
			<span data-testid={`pf-${value}`}>pf-{value}</span>
		);
		render(<AccDrop {...baseProps({ItemPostFix: PF})} />);
		expect(screen.getByTestId("pf-a")).toBeInTheDocument();
		expect(screen.getByTestId("pf-b")).toBeInTheDocument();
	});
});
