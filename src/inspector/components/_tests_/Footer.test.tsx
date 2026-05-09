/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";

// Stub the GetInfo helper so we never actually hit Photoshop APIs.
jest.mock("../../classes/GetInfo", () => ({
	GetInfo: {
		getBuildString: () => "26.0.0 build.123.456",
	},
}));

// Stub Main so we can flip the mode strings deterministically.
jest.mock("../../../shared/classes/Main", () => ({
	Main: {
		devMode: false,
		isFirstParty: false,
		privileged: false,
	},
}));

import {Footer} from "../FooterContainer";
import {Main} from "../../../shared/classes/Main";

const renderFooter = (props: Partial<any> = {}) =>
	render(<Footer parentPanel="inspector" {...props} />);

describe("<Footer />", () => {
	beforeEach(() => {
		Main.devMode = false;
		Main.isFirstParty = false;
		Main.privileged = false;
	});

	it("renders plugin and Photoshop version segments", () => {
		const {container} = renderFooter();
		// Two anchor tags inside .versionBar (plugin link + PS link)
		const links = container.querySelectorAll(".versionBar a");
		expect(links.length).toBeGreaterThanOrEqual(2);
		// PS version label is prefixed with "PS:"
		expect(container.textContent).toMatch(/PS:/);
		// UXP version label is prefixed with "UXP:"
		expect(container.textContent).toMatch(/UXP:/);
	});

	it("renders the current year in copyright", () => {
		renderFooter();
		const year = new Date().getFullYear().toString();
		expect(screen.getByText(/Copyright/)).toHaveTextContent(year);
	});

	it("shows PROD label by default", () => {
		const {container} = renderFooter();
		expect(container.textContent).toContain("PROD");
	});

	it("shows DEV label when Main.devMode is true", () => {
		Main.devMode = true;
		const {container} = renderFooter();
		expect(container.textContent).toContain("DEV");
	});

	it("shows the lightning glyph when isFirstParty", () => {
		Main.isFirstParty = true;
		const {container} = renderFooter();
		expect(container.textContent).toContain("⚡");
	});

	it("appends the privileged glyph when privileged", () => {
		Main.privileged = true;
		const {container} = renderFooter();
		expect(container.textContent).toContain("💥");
	});
});
