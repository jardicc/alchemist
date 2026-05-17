/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen, act} from "@testing-library/react";
import "@testing-library/jest-dom";

import {VirtualScroll, IVirtualScrollProps} from "../VirtualScroll";

// jsdom doesn't ship a ResizeObserver implementation; provide a minimal stub
// for the flex-mode test path.
class MockResizeObserver {
	observe(): void {}
	disconnect(): void {}
	unobserve(): void {}
}
(globalThis as any).ResizeObserver ??= MockResizeObserver;

// jsdom's requestAnimationFrame is async (setTimeout-based); run it synchronously
// so scroll-driven state updates are flushed within act().
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => { cb(0); return 0; };
(globalThis as any).cancelAnimationFrame = () => {};

const makeItems = (n: number) =>
	Array.from({length: n}, (_, i) => (
		<div key={i} data-testid={`vs-item-${i}`}>item-{i}</div>
	));

describe("<VirtualScroll />", () => {
	it("renders all items when count fits the container (autoHeight)", () => {
		render(
			<VirtualScroll items={makeItems(3)} itemHeight={20} autoHeight={{maxHeight: 1000}} />,
		);
		expect(screen.getByTestId("vs-item-0")).toBeInTheDocument();
		expect(screen.getByTestId("vs-item-1")).toBeInTheDocument();
		expect(screen.getByTestId("vs-item-2")).toBeInTheDocument();
	});

	it("supports the renderItem variant", () => {
		render(
			<VirtualScroll
				itemCount={2}
				renderItem={(i) => <div key={i} data-testid={`r-${i}`}>r-{i}</div>}
				itemHeight={20}
				autoHeight={{maxHeight: 100}}
			/>,
		);
		expect(screen.getByTestId("r-0")).toBeInTheDocument();
		expect(screen.getByTestId("r-1")).toBeInTheDocument();
	});

	it("only renders the visible window with overscan when scrolled (fixedHeight)", () => {
		const {container} = render(
			<VirtualScroll items={makeItems(100)} itemHeight={10} fixedHeight={50} overscan={1} />,
		);
		// Initial: scrollTop=0 -> indices 0..(50/10 + overscan=6)
		expect(screen.queryByTestId("vs-item-0")).toBeInTheDocument();
		expect(screen.queryByTestId("vs-item-50")).not.toBeInTheDocument();

		const scroller = container.firstElementChild as HTMLDivElement;
		act(() => {
			scroller.scrollTop = 500;
			scroller.dispatchEvent(new Event("scroll", {bubbles: true}));
		});
		// After scroll, item-0 should no longer be rendered
		expect(screen.queryByTestId("vs-item-0")).not.toBeInTheDocument();
		expect(screen.queryByTestId("vs-item-50")).toBeInTheDocument();
	});

	it("throws when itemHeight is not positive", () => {
		// React 16+ logs the error to console.error; silence it.
		const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		expect(() =>
			render(<VirtualScroll items={makeItems(1)} itemHeight={0} autoHeight={{maxHeight: 100}} />),
		).toThrow(/itemHeight must be greater than 0/);
		errSpy.mockRestore();
	});

	it("throws when neither fixedHeight, autoHeight nor flex is provided", () => {
		const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		expect(() =>
			render(<VirtualScroll items={makeItems(1)} itemHeight={10} />),
		).toThrow(/Either fixedHeight, autoHeight, or flex/);
		errSpy.mockRestore();
	});

	it("renders in flex mode without throwing", () => {
		expect(() =>
			render(<VirtualScroll items={makeItems(2)} itemHeight={20} flex />),
		).not.toThrow();
	});
});
