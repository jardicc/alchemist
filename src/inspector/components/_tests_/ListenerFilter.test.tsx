/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";

import {ListenerFilter} from "../ListenerFilterContainer";

const renderLF = (overrides: Partial<any> = {}) => {
	const props = {
		settings: {
			type: "none",
			exclude: [],
			include: [],
		},
		onSetNotifierListenerFilter: jest.fn(),
		...overrides,
	};
	return {...render(<ListenerFilter {...(props as any)} />), props};
};

describe("<ListenerFilter />", () => {
	it("always renders a 'Filter:' label and the dropdown options", () => {
		const {container} = renderLF();
		expect(screen.getByText("Filter:")).toBeInTheDocument();
		expect(container.textContent).toContain("None");
		expect(container.textContent).toContain("Include");
		expect(container.textContent).toContain("Exclude");
	});

	it("shows no extra input row when type is 'none'", () => {
		const {container} = renderLF({settings: {type: "none", exclude: [], include: []}});
		// Only the 'Filter:' label should exist.
		const labels = container.querySelectorAll(".label");
		expect(labels).toHaveLength(1);
	});

	it("shows the Include input when type is 'include'", () => {
		renderLF({settings: {type: "include", exclude: [], include: ["a", "b"]}});
		expect(screen.getByText("Include:")).toBeInTheDocument();
	});

	it("shows the Exclude input when type is 'exclude'", () => {
		renderLF({settings: {type: "exclude", exclude: ["x"], include: []}});
		expect(screen.getByText("Exclude:")).toBeInTheDocument();
	});
});
