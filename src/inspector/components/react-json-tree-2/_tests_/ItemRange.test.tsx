/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";

import ItemRange from "../ItemRange";

const noopStyling: any = (..._args: any[]) => ({className: "x"});

const baseProps = (overrides: Partial<any> = {}) => ({
	styling: noopStyling,
	from: 0,
	to: 9,
	renderChildNodes: () => <span data-testid="children">CHILDREN</span>,
	circularCache: new Set(),
	level: 0,
	nodeType: "Array" as const,
	...overrides,
});

describe("<ItemRange />", () => {
	it("renders the collapsed range label by default", () => {
		const {container, queryByTestId} = render(<ItemRange {...(baseProps({from: 5, to: 12}) as any)} />);
		expect(container.textContent).toContain("5 ... 12");
		expect(queryByTestId("children")).toBeNull();
	});

	it("expands to render child nodes after click", () => {
		const {container, getByTestId} = render(<ItemRange {...(baseProps() as any)} />);
		fireEvent.click(container.firstElementChild!);
		expect(getByTestId("children")).toBeInTheDocument();
	});
});
