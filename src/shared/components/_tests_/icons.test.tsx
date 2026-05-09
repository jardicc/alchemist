/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";

import {
	IconBan, IconBrowser, IconChat, IconDocument, IconImage, IconStar, IconInfo,
	IconPlayIcon, IconCaretBottom, IconArrowLeft,
} from "../icons";

/**
 * Spot-check a representative subset of icon components – they are pure SVG
 * factories so we just verify they render an <svg> element when invoked.
 */
describe("Icon components", () => {
	const cases: Array<[string, React.FC]> = [
		["IconBan", IconBan],
		["IconBrowser", IconBrowser],
		["IconChat", IconChat],
		["IconDocument", IconDocument],
		["IconImage", IconImage],
		["IconStar", IconStar],
		["IconInfo", IconInfo],
		["IconPlayIcon", IconPlayIcon],
		["IconCaretBottom", IconCaretBottom],
		["IconArrowLeft", IconArrowLeft],
	];

	it.each(cases)("%s renders an <svg> element", (_name, Comp) => {
		const {container} = render(<Comp />);
		expect(container.querySelector("svg")).not.toBeNull();
	});
});
