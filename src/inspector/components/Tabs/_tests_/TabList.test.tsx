/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {TabList, TTabList} from "../TabList";
import {TabPanel} from "../TabListPanel";

const renderTabs = (overrides: Partial<TTabList> = {}) => {
	const props: TTabList = {
		activeKey: "a",
		className: "test",
		onChange: jest.fn(),
		children: [
			<TabPanel key="a" id="a" title="Alpha"><div data-testid="content-a">A content</div></TabPanel>,
			<TabPanel key="b" id="b" title="Beta"><div data-testid="content-b">B content</div></TabPanel>,
		],
		...overrides,
	};
	return {...render(<TabList {...props} />), props};
};

describe("<TabList />", () => {
	it("renders one header per tab using the title", () => {
		renderTabs();
		expect(screen.getByText("Alpha")).toBeInTheDocument();
		expect(screen.getByText("Beta")).toBeInTheDocument();
	});

	it("marks active tab header with active class", () => {
		const {container} = renderTabs({activeKey: "b"});
		const headers = container.querySelectorAll(".tabHeader");
		expect(headers[0].className).not.toContain("active");
		expect(headers[1].className).toContain("active");
	});

	it("renders only the active tab's content", () => {
		renderTabs({activeKey: "a"});
		expect(screen.getByTestId("content-a")).toBeInTheDocument();
		expect(screen.queryByTestId("content-b")).not.toBeInTheDocument();
	});

	it("calls onChange with the tab id when a header is clicked", async () => {
		const onChange = jest.fn();
		// Silence the noisy console.log inside the click handler.
		const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
		renderTabs({activeKey: "a", onChange});

		await userEvent.click(screen.getByText("Beta"));

		expect(onChange).toHaveBeenCalledWith("b");
		logSpy.mockRestore();
	});

	it("renders postFix element after tab headers", () => {
		renderTabs({postFix: <div data-testid="post-fix">PF</div>});
		expect(screen.getByTestId("post-fix")).toBeInTheDocument();
	});

	it("renders 'No content' when activeKey doesn't match any tab", () => {
		renderTabs({activeKey: "missing"});
		expect(screen.getByText("No content")).toBeInTheDocument();
	});
});

describe("<TabPanel />", () => {
	it("renders its children", () => {
		render(
			<TabPanel id="x" title="X">
				<div data-testid="panel-content">hello</div>
			</TabPanel>,
		);
		expect(screen.getByTestId("panel-content")).toBeInTheDocument();
	});
});
