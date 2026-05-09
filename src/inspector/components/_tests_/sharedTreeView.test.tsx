/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";

import {labelRenderer, renderPath, shouldExpandNode} from "../sharedTreeView";

describe("sharedTreeView helpers", () => {
	describe("labelRenderer()", () => {
		it("renders the key text and the pin icon by default", () => {
			const onInspect = jest.fn();
			const {container} = render(<>{labelRenderer(["myKey"], onInspect, "Object", true, true)}</>);
			expect(container.querySelector(".treeItemKey")?.textContent).toBe("myKey");
			expect(container.querySelector(".treeItemPin")).not.toBeNull();
		});

		it("strips the $$$noPin_ prefix and hides the pin icon", () => {
			const onInspect = jest.fn();
			const {container} = render(
				<>{labelRenderer(["$$$noPin_secret"], onInspect, "Object", false, false)}</>,
			);
			expect(container.querySelector(".treeItemKey")?.textContent).toBe("secret");
			expect(container.querySelector(".treeItemPin")).toBeNull();
		});

		it("appends ': ' separator when not expanded", () => {
			const onInspect = jest.fn();
			const {container} = render(
				<>{labelRenderer(["k"], onInspect, "Object", false, false)}</>,
			);
			expect(container.textContent).toContain(": ");
		});

		it("does not append ': ' when expanded", () => {
			const onInspect = jest.fn();
			const {container} = render(
				<>{labelRenderer(["k"], onInspect, "Object", true, true)}</>,
			);
			expect(container.textContent).not.toContain(": ");
		});

		it("calls onInspect with the reversed full path on pin click", () => {
			const onInspect = jest.fn();
			const {container} = render(
				<>{labelRenderer(["leaf", "mid", "root"], onInspect, "Object", false, false)}</>,
			);
			const pin = container.querySelector(".treeItemPin") as HTMLElement;
			pin.click();
			expect(onInspect).toHaveBeenCalledWith(["root", "mid", "leaf"], "add");
		});

		it("flags expandable on the key when expandable=true", () => {
			const onInspect = jest.fn();
			const {container} = render(
				<>{labelRenderer(["k"], onInspect, "Object", false, true)}</>,
			);
			expect(container.querySelector(".treeItemKey")?.className).toContain("expandable");
		});
	});

	describe("renderPath()", () => {
		it("returns a 'root' element + one element per path segment", () => {
			const onInspect = jest.fn();
			const parts = renderPath(["a", "b"], onInspect);
			expect(parts).toHaveLength(3);
		});

		it("clicking root calls onInspect with [] and 'replace'", () => {
			const onInspect = jest.fn();
			const {container} = render(<>{renderPath(["a", "b"], onInspect)}</>);
			const items = container.querySelectorAll(".pathItem");
			(items[0] as HTMLElement).click();
			expect(onInspect).toHaveBeenCalledWith([], "replace");
		});

		it("clicking a segment calls onInspect with the slice up to that index", () => {
			const onInspect = jest.fn();
			const {container} = render(<>{renderPath(["a", "b", "c"], onInspect)}</>);
			const items = container.querySelectorAll(".pathItem");
			(items[2] as HTMLElement).click(); // index 1 of path -> ["a","b"]
			expect(onInspect).toHaveBeenCalledWith(["a", "b"], "replace");
		});
	});

	describe("shouldExpandNode()", () => {
		it("returns false when level is undefined and key not preset", () => {
			const fn = shouldExpandNode([], 0);
			// level undefined -> false
			expect(fn(["x"], {}, undefined as any)).toBe(false);
		});

		it("returns true when keyPath matches an expandedKeys entry at correct level", () => {
			const fn = shouldExpandNode([["a", "b"]], 0);
			// reverse(keyPath).join("-") must equal "a-b"
			expect(fn(["b", "a"], {}, 2)).toBe(true);
		});

		it("respects autoExpandLevels (numeric threshold)", () => {
			const fn = shouldExpandNode([], 2);
			expect(fn(["x"], {}, 1)).toBe(true);
			expect(fn(["x"], {}, 2)).toBe(true);
			expect(fn(["x"], {}, 3)).toBe(false);
		});

		it("expands all levels with autoExpandLevels=10 + allowInfinity", () => {
			const fn = shouldExpandNode([], 10, true);
			expect(fn(["x"], {}, 99)).toBe(true);
		});

		it("does NOT auto-expand all when allowInfinity is false", () => {
			const fn = shouldExpandNode([], 10, false);
			// levels <= 10 are still expanded; level 99 is not
			expect(fn(["x"], {}, 99)).toBe(false);
			expect(fn(["x"], {}, 5)).toBe(true);
		});
	});
});
