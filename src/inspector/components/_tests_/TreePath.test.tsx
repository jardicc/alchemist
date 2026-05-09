/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {TreePath, TTreePath} from "../TreePath";

const renderTree = (overrides: Partial<TTreePath> = {}) => {
	const props: TTreePath = {
		autoExpandLevels: 3,
		path: ["a", "b", "c"],
		onInspectPath: jest.fn(),
		onSetAutoExpandLevel: jest.fn(),
		...overrides,
	};
	return {...render(<TreePath {...props} />), props};
};

describe("<TreePath />", () => {
	it("renders 'root' link plus a link per path segment", () => {
		const {container} = renderTree({path: ["a", "b", "c"]});
		const links = container.querySelectorAll(".pathItem .link");
		// root + 3 path items
		expect(links).toHaveLength(4);
		expect(links[0].textContent).toBe("root");
		expect(links[1].textContent).toBe("a");
		expect(links[2].textContent).toBe("b");
		expect(links[3].textContent).toBe("c");
	});

	it("calls onInspectPath with [] when 'root' is clicked", async () => {
		const onInspectPath = jest.fn();
		renderTree({path: ["x", "y"], onInspectPath});

		await userEvent.click(screen.getByText("root"));

		expect(onInspectPath).toHaveBeenCalledWith([], "replace");
	});

	it("calls onInspectPath with the partial path when a segment is clicked", async () => {
		const onInspectPath = jest.fn();
		renderTree({path: ["x", "y", "z"], onInspectPath});

		await userEvent.click(screen.getByText("y"));

		expect(onInspectPath).toHaveBeenCalledWith(["x", "y"], "replace");
	});

	it("renders the level slider label by default", () => {
		renderTree({autoExpandLevels: 2});
		expect(screen.getByText(/Expand:/)).toHaveTextContent(/Expand:\s*2/);
	});

	it("shows 'Off' when autoExpandLevels=0", () => {
		renderTree({autoExpandLevels: 0});
		expect(screen.getByText(/Expand:/).textContent).toMatch(/Off/);
	});

	it("shows 'All' when autoExpandLevels=10 and allowInfinityLevels=true", () => {
		renderTree({autoExpandLevels: 10, allowInfinityLevels: true});
		expect(screen.getByText(/Expand:/).textContent).toMatch(/All/);
	});

	it("hides the level slider when hideLevels=true", () => {
		const {container} = renderTree({hideLevels: true});
		expect(container.querySelector(".levelSlider")).toBeNull();
	});
});
