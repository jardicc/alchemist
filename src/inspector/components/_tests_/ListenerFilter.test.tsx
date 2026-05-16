/**
 * @jest-environment jsdom
 */
import React from "react";
import {screen} from "@testing-library/react";
import "@testing-library/jest-dom";

import {ListenerFilter} from "../ListenerFilterContainer";
import {renderWithStore} from "../../../__tests__/renderWithStore";

const makeState = (filter: {type: string; exclude: string[]; include: string[]}) => ({
	inspector: {
		selectedReferenceType: "listener",
		settings: {
			listenerFilter: filter,
		},
	},
});

const renderLF = (filter: {type: string; exclude: string[]; include: string[]} = {type: "none", exclude: [], include: []}) =>
	renderWithStore(<ListenerFilter />, {preloadedState: makeState(filter)});

describe("<ListenerFilter />", () => {
	it("always renders a 'Filter:' label and the dropdown options", () => {
		const {container} = renderLF();
		expect(screen.getByText("Filter:")).toBeInTheDocument();
		expect(container.textContent).toContain("None");
		expect(container.textContent).toContain("Include");
		expect(container.textContent).toContain("Exclude");
	});

	it("shows no extra input row when type is 'none'", () => {
		const {container} = renderLF({type: "none", exclude: [], include: []});
		// Only the 'Filter:' label should exist.
		const labels = container.querySelectorAll(".label");
		expect(labels).toHaveLength(1);
	});

	it("shows the Include input when type is 'include'", () => {
		renderLF({type: "include", exclude: [], include: ["a", "b"]});
		expect(screen.getByText("Include:")).toBeInTheDocument();
	});

	it("shows the Exclude input when type is 'exclude'", () => {
		renderLF({type: "exclude", exclude: ["x"], include: []});
		expect(screen.getByText("Exclude:")).toBeInTheDocument();
	});
});
