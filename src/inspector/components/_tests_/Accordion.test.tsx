/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {Accordion, IAccordionProps} from "../Accordion";

/**
 * Tests target the public contract:
 *   - rendered DOM (queried via stable text / class selectors)
 *   - props -> callback wiring
 *   - children rendered only when expanded
 *
 * They intentionally avoid asserting CSS class concatenation or icon SVG
 * internals so the suite stays valid through a future class -> function
 * migration.
 */
describe("<Accordion />", () => {
	const renderAcc = (overrides: Partial<IAccordionProps> = {}) => {
		const props: IAccordionProps = {
			id: "panel-a",
			header: "My header",
			expanded: false,
			onChange: jest.fn(),
			children: <div data-testid="acc-child">child content</div>,
			...overrides,
		};
		const utils = render(<Accordion {...props} />);
		return {...utils, props};
	};

	it("renders the header text", () => {
		renderAcc({header: "Hello"});
		expect(screen.getByText("Hello")).toBeInTheDocument();
	});

	it("hides children when collapsed (expanded=false)", () => {
		renderAcc({expanded: false});
		expect(screen.queryByTestId("acc-child")).not.toBeInTheDocument();
	});

	it("shows children when expanded (boolean=true)", () => {
		renderAcc({expanded: true});
		expect(screen.getByTestId("acc-child")).toBeInTheDocument();
	});

	it("treats expanded=string[] as expanded when id is included", () => {
		renderAcc({id: "panel-a", expanded: ["other", "panel-a"]});
		expect(screen.getByTestId("acc-child")).toBeInTheDocument();
	});

	it("treats expanded=string[] as collapsed when id missing", () => {
		renderAcc({id: "panel-a", expanded: ["other"]});
		expect(screen.queryByTestId("acc-child")).not.toBeInTheDocument();
	});

	it("calls onChange(id, !isExpanded) when header is clicked", async () => {
		const onChange = jest.fn();
		renderAcc({id: "x", expanded: false, header: "Click me", onChange});

		await userEvent.click(screen.getByText("Click me"));

		expect(onChange).toHaveBeenCalledWith("x", true);
	});

	it("toggles to false when starting expanded", async () => {
		const onChange = jest.fn();
		renderAcc({id: "x", expanded: true, header: "Click me", onChange});

		await userEvent.click(screen.getByText("Click me"));

		expect(onChange).toHaveBeenCalledWith("x", false);
	});

	it("appends custom className to root", () => {
		const {container} = renderAcc({className: "my-extra"});
		const root = container.querySelector(".Accordion");
		expect(root).not.toBeNull();
		expect(root!.className).toContain("my-extra");
	});

	it("renders a JSX element header", () => {
		renderAcc({header: <span data-testid="hdr-el">JSX header</span>});
		expect(screen.getByTestId("hdr-el")).toBeInTheDocument();
	});
});
