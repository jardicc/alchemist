/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";

import JSONArrow from "../JSONArrow";

const noopStyling: any = (..._args: any[]) => ({className: "x"});

describe("<JSONArrow />", () => {
	it("renders the collapsed glyph when not expanded", () => {
		const {container} = render(
			<JSONArrow styling={noopStyling} expanded={false} nodeType="Object" onClick={jest.fn()} />,
		);
		expect(container.textContent).toContain("\u25B6");
	});

	it("renders the expanded glyph when expanded", () => {
		const {container} = render(
			<JSONArrow styling={noopStyling} expanded={true} nodeType="Object" onClick={jest.fn()} />,
		);
		expect(container.textContent).toContain("\u25BC");
	});

	it("renders an extra inner glyph when arrowStyle='double'", () => {
		const {container} = render(
			<JSONArrow styling={noopStyling} expanded={false} nodeType="Array" onClick={jest.fn()} arrowStyle="double" />,
		);
		// One outer collapsed glyph + one inner sub-arrow glyph
		const occurrences = (container.textContent ?? "").split("\u25B6").length - 1;
		expect(occurrences).toBeGreaterThanOrEqual(2);
	});

	it("invokes onClick when the arrow container is clicked", () => {
		const onClick = jest.fn();
		const {container} = render(
			<JSONArrow styling={noopStyling} expanded={false} nodeType="Object" onClick={onClick} />,
		);
		fireEvent.click(container.firstElementChild!);
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
