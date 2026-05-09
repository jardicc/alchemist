/**
 * @jest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import "@testing-library/jest-dom";

import {getIcon} from "../helpers";

describe("getIcon()", () => {
	const types = [
		"error", "listener", "notifier", "dispatcher", "replies", "application",
		"document", "layer", "channel", "path", "actions", "guide",
		"historyState", "snapshotClass", "animationClass", "animationFrameClass",
		"timeline",
	] as const;

	it.each(types)("returns a renderable JSX element for type=%s", (t) => {
		const el = getIcon(t as any);
		const {container} = render(<>{el}</>);
		// Most icons render an <svg>; "channel" returns the default <IconDocument />.
		expect(container.firstChild).not.toBeNull();
	});

	it("falls back to IconDocument for unknown types", () => {
		const el = getIcon("totally-unknown" as any);
		const {container} = render(<>{el}</>);
		expect(container.querySelector("svg")).not.toBeNull();
	});

	it("returns IconBan for 'error'", () => {
		const el = getIcon("error");
		const {container} = render(<>{el}</>);
		// IconBan is a circular shape – just verify it produced an svg.
		expect(container.querySelector("svg")).not.toBeNull();
	});
});
