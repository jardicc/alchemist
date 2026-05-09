/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {ErrorBoundary} from "../ErrorBoundary";

// Suppress noisy React error-boundary console output for the failing-child test.
const Boom: React.FC<{msg?: string}> = ({msg = "kaboom"}) => {
	throw new Error(msg);
};

describe("<ErrorBoundary />", () => {
	let errSpy: jest.SpyInstance;
	let logSpy: jest.SpyInstance;

	beforeEach(() => {
		errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
	});
	afterEach(() => {
		errSpy.mockRestore();
		logSpy.mockRestore();
	});

	it("renders children when no error", () => {
		render(
			<ErrorBoundary>
				<div data-testid="ok">All good</div>
			</ErrorBoundary>,
		);
		expect(screen.getByTestId("ok")).toBeInTheDocument();
	});

	it("renders fallback UI when a child throws", () => {
		render(
			<ErrorBoundary>
				<Boom msg="explode" />
			</ErrorBoundary>,
		);
		expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
		expect(screen.getByText(/Reload panel/i)).toBeInTheDocument();
		expect(screen.getByText(/Reset panel state/i)).toBeInTheDocument();
	});

	it("displays error stack inside fallback when present", () => {
		render(
			<ErrorBoundary>
				<Boom msg="my-stack-msg" />
			</ErrorBoundary>,
		);
		// Stack contains the error message string
		expect(document.body.textContent).toContain("my-stack-msg");
	});
});
