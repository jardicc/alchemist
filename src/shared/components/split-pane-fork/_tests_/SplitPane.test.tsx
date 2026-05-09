/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";

import {Pane} from "../Pane";
import {Resizer, RESIZER_DEFAULT_CLASSNAME} from "../Resizer";
import {SplitPane} from "../SplitPane";

describe("<Pane />", () => {
	it("renders children", () => {
		const {container} = render(
			<Pane><div data-testid="pane-child">x</div></Pane>,
		);
		expect(screen.getByTestId("pane-child")).toBeInTheDocument();
		expect(container.querySelector(".Pane")).not.toBeNull();
	});

	it("applies vertical width when split=vertical", () => {
		const {container} = render(<Pane split="vertical" size={120}><span/></Pane>);
		const el = container.querySelector(".Pane") as HTMLElement;
		expect(el.style.width).toBe("120px");
	});

	it("applies horizontal height when split=horizontal", () => {
		const {container} = render(<Pane split="horizontal" size={80}><span/></Pane>);
		const el = container.querySelector(".Pane") as HTMLElement;
		expect(el.style.height).toBe("80px");
	});

	it("merges custom className", () => {
		const {container} = render(<Pane className="extra"><span/></Pane>);
		expect(container.querySelector(".Pane")?.className).toContain("extra");
	});

	it("merges custom style props", () => {
		const {container} = render(
			<Pane style={{background: "red"}}><span/></Pane>,
		);
		const el = container.querySelector(".Pane") as HTMLElement;
		expect(el.style.background).toBe("red");
	});
});

describe("<Resizer />", () => {
	it("renders default class name", () => {
		const {container} = render(<Resizer split="vertical" />);
		expect(container.querySelector(`.${RESIZER_DEFAULT_CLASSNAME}`)).not.toBeNull();
	});

	it("uses custom resizerClassName when provided", () => {
		const {container} = render(<Resizer resizerClassName="custom-r" split="vertical" />);
		expect(container.querySelector(".custom-r")).not.toBeNull();
	});

	it("calls onMouseDown on mousedown", () => {
		const onMouseDown = jest.fn();
		const {container} = render(<Resizer onMouseDown={onMouseDown} split="vertical" />);
		fireEvent.mouseDown(container.firstElementChild!);
		expect(onMouseDown).toHaveBeenCalledTimes(1);
	});

	it("calls onClick on click", () => {
		const onClick = jest.fn();
		const {container} = render(<Resizer onClick={onClick} split="vertical" />);
		fireEvent.click(container.firstElementChild!);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("calls onDoubleClick on double click", () => {
		const onDoubleClick = jest.fn();
		const {container} = render(<Resizer onDoubleClick={onDoubleClick} split="vertical" />);
		fireEvent.doubleClick(container.firstElementChild!);
		expect(onDoubleClick).toHaveBeenCalledTimes(1);
	});
});

describe("<SplitPane />", () => {
	it("renders both panes and a resizer between them", () => {
		const {container} = render(
			<SplitPane split="vertical" defaultSize={100} primary="first" allowResize minSize={0} paneClassName="" pane1ClassName="" pane2ClassName="">
				<div data-testid="left">L</div>
				<div data-testid="right">R</div>
			</SplitPane>,
		);
		expect(screen.getByTestId("left")).toBeInTheDocument();
		expect(screen.getByTestId("right")).toBeInTheDocument();
		expect(container.querySelector(`.${RESIZER_DEFAULT_CLASSNAME}`)).not.toBeNull();
	});

	it("renders horizontal split without throwing", () => {
		expect(() =>
			render(
				<SplitPane split="horizontal" defaultSize={50} primary="second" allowResize={false} minSize={0} paneClassName="" pane1ClassName="" pane2ClassName="">
					<div>top</div>
					<div>bot</div>
				</SplitPane>,
			),
		).not.toThrow();
	});
});
