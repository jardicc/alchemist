import "@testing-library/jest-dom";

// jsdom does not ship a ResizeObserver implementation; provide a minimal stub
// so any component that uses one (e.g. VirtualScroll) doesn't crash.
class MockResizeObserver {
	observe(): void {}
	disconnect(): void {}
	unobserve(): void {}
}
(globalThis as any).ResizeObserver ??= MockResizeObserver;
