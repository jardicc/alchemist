/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";

import {VisualDiffTab} from "../VisualDiff";

describe("<VisualDiffTab />", () => {
	it("renders 'n/a' when either side is missing", () => {
		const {rerender} = render(<VisualDiffTab left={null} right={{a: 1}} />);
		expect(screen.getByText("n/a")).toBeInTheDocument();

		rerender(<VisualDiffTab left={{a: 1}} right={null} />);
		expect(screen.getByText("n/a")).toBeInTheDocument();

		rerender(<VisualDiffTab left={null} right={null} />);
		expect(screen.getByText("n/a")).toBeInTheDocument();
	});

	it("renders 'Content is same' for equal objects (no diff)", () => {
		const same = {x: 1, y: "z"};
		render(<VisualDiffTab left={same} right={{...same}} />);
		expect(screen.getByText("Content is same")).toBeInTheDocument();
	});

	it("renders the diff HTML when objects differ", () => {
		const {container} = render(
			<VisualDiffTab left={{x: 1}} right={{x: 2}} />,
		);
		// jsondiffpatch outputs into a .VisualDiff div via dangerouslySetInnerHTML
		const root = container.querySelector(".VisualDiff");
		expect(root).not.toBeNull();
		expect((root as HTMLElement).innerHTML.length).toBeGreaterThan(0);
	});
});
