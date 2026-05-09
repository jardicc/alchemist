/**
 * @jest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import "@testing-library/jest-dom";

import {flattenTree, FlattenTreeOptions} from "../flattenTree";

const noopStyling: any = (..._args: any[]) => ({});

const baseOptions = (overrides: Partial<FlattenTreeOptions> = {}): FlattenTreeOptions => ({
	styling: noopStyling,
	labelRenderer: ([k]) => <span>{String(k)}:</span>,
	valueRenderer: (display) => display as React.ReactNode,
	getItemString: (_t, _d, itemType, itemString) => <span>{itemType}{itemString}</span>,
	postprocessValue: (v) => v,
	isCustomNode: () => false,
	collectionLimit: 200,
	sortObjectKeys: false,
	protoMode: "none",
	hideRoot: false,
	expandedPaths: new Map(),
	onToggle: () => {},
	expandClicked: () => {},
	shouldExpandNodeInitially: (_kp, _v, level) => level === 0,
	shouldExpandNode: () => false,
	...overrides,
});

describe("flattenTree()", () => {
	it("returns a single value descriptor for a primitive", () => {
		const {descriptors, renderItem} = flattenTree(42, ["root"], baseOptions());
		expect(descriptors.length).toBe(1);
		expect(typeof renderItem).toBe("function");
	});

	it("flattens an expanded object root with its keys", () => {
		const data = {a: 1, b: 2};
		const {descriptors} = flattenTree(data, ["root"], baseOptions());
		// 1 nested for root + 2 child values
		expect(descriptors.length).toBe(3);
	});

	it("hides root row when hideRoot=true", () => {
		const data = {a: 1, b: 2};
		const {descriptors} = flattenTree(data, [], baseOptions({hideRoot: true}));
		// only 2 child rows
		expect(descriptors.length).toBe(2);
	});

	it("does not descend into a nested object that should not be expanded", () => {
		const data = {a: {b: 1, c: 2}};
		const {descriptors} = flattenTree(
			data,
			["root"],
			baseOptions({shouldExpandNodeInitially: (_kp, _v, level) => level === 0}),
		);
		// root + a (collapsed)
		expect(descriptors.length).toBe(2);
	});

	it("renderItem returns a React element for each descriptor", () => {
		const data = {a: 1};
		const {descriptors, renderItem} = flattenTree(data, ["root"], baseOptions());
		for (let i = 0; i < descriptors.length; i++) {
			const el = renderItem(i);
			expect(React.isValidElement(el)).toBe(true);
			const {container, unmount} = render(<ul>{el}</ul>);
			expect(container.querySelector("li")).not.toBeNull();
			unmount();
		}
	});

	it("emits range descriptors when an array exceeds collectionLimit", () => {
		const data = Array.from({length: 250}, (_, i) => i);
		const {descriptors} = flattenTree(
			data,
			["root"],
			baseOptions({collectionLimit: 100}),
		);
		const hasRange = descriptors.some((d: any) => "rangeKey" in d);
		expect(hasRange).toBe(true);
	});
});
