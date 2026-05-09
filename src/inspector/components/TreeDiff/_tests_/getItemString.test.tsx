/**
 * @jest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import "@testing-library/jest-dom";

import {getItemString} from "../getItemString";

const renderToText = (el: JSX.Element) => {
	const {container} = render(<>{el}</>);
	return container.textContent ?? "";
};

describe("getItemString()", () => {
	it("renders empty object as {}", () => {
		expect(renderToText(getItemString("Object", {}, true, false))).toContain("{");
	});

	it("renders narrow-layout object as {…}", () => {
		expect(renderToText(getItemString("Object", {a: 1}, false, false))).toContain("{…}");
	});

	it("renders wide-layout object with key/value preview", () => {
		const text = renderToText(getItemString("Object", {a: 1, b: "x"}, true, false));
		expect(text).toMatch(/a:/);
		expect(text).toMatch(/b:/);
	});

	it("truncates objects with more than 3 keys", () => {
		const text = renderToText(
			getItemString("Object", {a: 1, b: 2, c: 3, d: 4, e: 5}, true, false),
		);
		expect(text).toContain("…");
	});

	it("renders empty array as []", () => {
		expect(renderToText(getItemString("Array", [], true, false))).toContain("[]");
	});

	it("renders narrow-layout non-empty array as [...]", () => {
		expect(renderToText(getItemString("Array", [1, 2], false, false))).toContain("[…]");
	});

	it("renders wide-layout array with item previews", () => {
		const text = renderToText(getItemString("Array", [1, 2, 3], true, false));
		expect(text).toMatch(/1.*2.*3/);
	});

	it("truncates long arrays with …", () => {
		const text = renderToText(getItemString("Array", [1, 2, 3, 4, 5], true, false));
		expect(text).toContain("…");
	});

	it("returns the raw type for non-Object/non-Array types", () => {
		expect(renderToText(getItemString("string", "hi", true, false))).toContain("string");
	});

	it("renders 'Immutable' prefix when @@__IS_IMMUTABLE__@@ flag is set", () => {
		const data: any = {"@@__IS_IMMUTABLE__@@": true};
		expect(renderToText(getItemString("Object", data, true, false))).toContain("Immutable");
	});
});
