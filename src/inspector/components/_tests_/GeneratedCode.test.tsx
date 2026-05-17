/**
 * @jest-environment jsdom
 */
/**
 * @jest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import {renderWithStore} from "../../../__tests__/renderWithStore";

jest.mock("../../selectors/inspectorCodeSelectors", () => ({
	getGeneratedCode: jest.fn(() => ""),
}));

import {GeneratedCode} from "../GeneratedCode";

describe("<GeneratedCode />", () => {
	it("renders the generated code wrapper", () => {
		const {container} = renderWithStore(<GeneratedCode />, {preloadedState: {}});
		expect(container.querySelector(".GeneratedCode")).not.toBeNull();
	});

	it("passes the code prop down to the textarea element", () => {
		const {container} = renderWithStore(<GeneratedCode />, {preloadedState: {}});
		expect(container.querySelector(".GeneratedCode")).toBeInTheDocument();
	});
});
