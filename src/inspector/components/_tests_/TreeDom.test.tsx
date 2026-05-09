/**
 * @jest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import "@testing-library/jest-dom";

// Heavy children: stub them out so we test only TreeDom branches.
jest.mock("../react-json-tree-2", () => ({
	JSONTree: () => <div data-testid="json-tree" />,
}));
jest.mock("../TreePath", () => ({
	TreePath: () => <div data-testid="tree-path" />,
}));

import {TreeDom} from "../TreeDomContainer";
import {getItemString} from "../TreeDiff/getItemString";

const baseProps = (overrides: Partial<any> = {}) => ({
	path: ["root"],
	content: {hello: "world"},
	expandedKeys: [],
	protoMode: "uxp" as const,
	autoExpandLevels: 0,
	onInspectPath: jest.fn(),
	onSetExpandedPath: jest.fn(),
	onSetAutoExpandLevel: jest.fn(),
	...overrides,
});

describe("<TreeDom />", () => {
	it("renders a 'nothing to see' message when content is null/undefined", () => {
		const {container} = render(<TreeDom {...baseProps({content: null})} />);
		expect(container.textContent).toContain("Nothing to see there");
	});

	it("renders the TreePath and JSONTree when content is present", () => {
		const {getByTestId} = render(<TreeDom {...baseProps()} />);
		expect(getByTestId("tree-path")).toBeInTheDocument();
		expect(getByTestId("json-tree")).toBeInTheDocument();
	});

	it("wraps a primitive content into a noPin object so JSONTree can be rendered", () => {
		const {getByTestId} = render(<TreeDom {...baseProps({content: 7, path: ["x"]})} />);
		// Should still render JSONTree without throwing
		expect(getByTestId("json-tree")).toBeInTheDocument();
	});

	it("getItemString delegates to the shared item string helper", () => {
		const out = getItemString("Object", {a: 1}, true, false);
		expect(React.isValidElement(out)).toBe(true);
	});
});
