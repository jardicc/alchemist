/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";

// Stub heavy children — we are testing TreeContent's wiring, not the trees.
jest.mock("../react-json-tree-2", () => ({
	JSONTree: (props: any) =>
		React.createElement("div", {
			"data-testid": "json-tree",
			"data-data": JSON.stringify(props.data),
		}),
}));

jest.mock("../TreePath", () => ({
	TreePath: (props: any) =>
		React.createElement("div", {
			"data-testid": "tree-path",
			"data-path": JSON.stringify(props.path),
			"data-levels": String(props.autoExpandLevels),
			"data-hide-levels": String(!!props.hideLevels),
		}),
}));

import {TreeContent} from "../TreeContentContainer";

const baseProps = (over: Partial<any> = {}): any => ({
	content: {hello: "world"},
	path: ["root"],
	expandedKeys: [],
	protoMode: "uxp",
	descriptorContent: "",
	viewType: "tree",
	autoExpandLevels: 1,
	search: "",
	onInspectPath: jest.fn(),
	onSetExpandedPath: jest.fn(),
	onSetView: jest.fn(),
	onSetAutoExpandLevel: jest.fn(),
	onSetSearch: jest.fn(),
	...over,
});

describe("<TreeContent />", () => {
	it("renders the JSONTree with the content data when in 'tree' view", () => {
		render(<TreeContent {...baseProps()} />);
		const tree = screen.getByTestId("json-tree");
		expect(tree).toBeInTheDocument();
		expect(tree.getAttribute("data-data")).toBe(JSON.stringify({hello: "world"}));
	});

	it("renders the TreePath with the current path", () => {
		render(<TreeContent {...baseProps({path: ["a", "b"]})} />);
		const tp = screen.getAllByTestId("tree-path")[0];
		expect(tp.getAttribute("data-path")).toBe(JSON.stringify(["a", "b"]));
	});

	it("renders the missing-content message when content is null", () => {
		render(<TreeContent {...baseProps({content: null})} />);
		expect(
			screen.getByText(/Content is missing/i),
		).toBeInTheDocument();
		// JSONTree should not render in that case
		expect(screen.queryByTestId("json-tree")).not.toBeInTheDocument();
	});

	it("propagates the search field input via onSetSearch", () => {
		const onSetSearch = jest.fn();
		const {container} = render(<TreeContent {...baseProps({onSetSearch})} />);
		const search = container.querySelector(".filterContent") as HTMLInputElement;
		expect(search).not.toBeNull();
		fireEvent.input(search, {target: {value: "needle"}});
		expect(onSetSearch).toHaveBeenCalledWith("needle");
	});

	it("hides the level slider on the Raw tab's TreePath", () => {
		// Switch to the 'raw' tab by passing it as the active viewType.
		render(<TreeContent {...baseProps({viewType: "raw"})} />);
		const tp = screen.getByTestId("tree-path");
		expect(tp.getAttribute("data-hide-levels")).toBe("true");
	});
});
