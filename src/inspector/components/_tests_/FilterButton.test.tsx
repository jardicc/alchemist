/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {FilterButton, IFilterButtonProps, TFilterState} from "../FilterButton";

/**
 * Tests target the public contract:
 *   - rendered DOM (queried via stable `data-testid` / `data-state` attributes)
 *   - props -> callback wiring
 *
 * They intentionally avoid:
 *   - reaching into class-based React internals (state, instance methods)
 *   - asserting CSS class names by exact concatenation
 *   - snapshotting the IconEye SVG content
 *
 * This keeps the suite valid after the planned class -> function migration.
 */
describe("<FilterButton />", () => {
	const renderBtn = (overrides: Partial<IFilterButtonProps> = {}) => {
		const props: IFilterButtonProps = {
			state: "off",
			subtype: "main",
			onClick: jest.fn(),
			...overrides,
		};
		const utils = render(<FilterButton {...props} />);
		return {...utils, props};
	};

	it("renders root button with default attributes", () => {
		renderBtn();

		const btn = screen.getByTestId("filter-button");
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute("data-state", "off");
		expect(btn).toHaveAttribute("data-subtype", "main");
		expect(btn).toHaveAttribute("title", "Filter");
		expect(screen.getByTestId("filter-button-icon")).toBeInTheDocument();
	});

	it.each<TFilterState>(["on", "off", "semi"])(
		"reflects state=%s on the data-state attribute",
		(state) => {
			renderBtn({state});
			expect(screen.getByTestId("filter-button")).toHaveAttribute("data-state", state);
		},
	);

	it("reflects subtype on the data-subtype attribute", () => {
		renderBtn({subtype: "properties"});
		expect(screen.getByTestId("filter-button")).toHaveAttribute("data-subtype", "properties");
	});

	it("invokes onClick with subtype, state and the click event", async () => {
		const onClick = jest.fn();
		renderBtn({state: "semi", subtype: "properties", onClick});

		await userEvent.click(screen.getByTestId("filter-button"));

		expect(onClick).toHaveBeenCalledTimes(1);
		const [subtypeArg, stateArg, evtArg] = onClick.mock.calls[0];
		expect(subtypeArg).toBe("properties");
		expect(stateArg).toBe("semi");
		expect(evtArg).toBeDefined();
		expect(typeof evtArg.preventDefault).toBe("function");
	});

	it("invokes onClick when the inner icon is clicked (event bubbles)", async () => {
		const onClick = jest.fn();
		renderBtn({onClick});

		await userEvent.click(screen.getByTestId("filter-button-icon"));

		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
