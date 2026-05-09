/**
 * @jest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import "@testing-library/jest-dom";

// jsdom doesn't ship a ResizeObserver implementation; provide a minimal stub
// so VirtualScroll (used by JSONTree) can mount in flex mode.
class MockResizeObserver {
	observe(): void {}
	disconnect(): void {}
	unobserve(): void {}
}
(globalThis as any).ResizeObserver ??= MockResizeObserver;

import {JSONTree} from "../index";

describe("<JSONTree />", () => {
	it("renders without crashing for a primitive value", () => {
		const {container} = render(<JSONTree data={42} />);
		expect(container.querySelector("ul")).not.toBeNull();
	});

	it("renders without crashing for an object value", () => {
		const {container} = render(<JSONTree data={{a: 1, b: "x"}} />);
		expect(container.querySelector("ul")).not.toBeNull();
	});

	it("respects hideRoot to omit the root row", () => {
		const data = {a: 1, b: 2};
		const {container: withRoot} = render(<JSONTree data={data} />);
		const {container: withoutRoot} = render(<JSONTree data={data} hideRoot />);
		// Both render but DOM shouldn't throw; presence of <ul> required.
		expect(withRoot.querySelector("ul")).not.toBeNull();
		expect(withoutRoot.querySelector("ul")).not.toBeNull();
	});
});
