/**
 * @jest-environment jsdom
 */
import React from "react";
import {fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";
import {createStore} from "redux";

// Stub the inspector selectors module so the connected child can read state
// without us having to recreate the full IRootState shape.
jest.mock("../../selectors/inspectorSelectors", () => ({
	getCategoryItemsVisibility: () => ["document"],
}));
// Stub the action creator so dispatching produces a plain object.
jest.mock("../../actions/inspectorActions", () => ({
	setCategoryItemVisibilityAction: (item: any, op: any) => ({type: "SET_VIS", item, op}),
}));

import {renderWithStore} from "../../../__tests__/renderWithStore";
import {ItemVisibilityButtonWrap} from "../ItemVisibilityButton";

describe("<ItemVisibilityButtonWrap />", () => {
	it("renders with the 'visible' class when value is in visibleItems", () => {
		const {container} = renderWithStore(<ItemVisibilityButtonWrap value="document" />);
		const root = container.querySelector(".ItemVisibilityButton");
		expect(root).not.toBeNull();
		expect(root!.className).toContain("visible");
	});

	it("renders with the 'hidden' class when value is NOT in visibleItems", () => {
		const {container} = renderWithStore(<ItemVisibilityButtonWrap value="layer" />);
		const root = container.querySelector(".ItemVisibilityButton");
		expect(root).not.toBeNull();
		expect(root!.className).toContain("hidden");
	});

	it("dispatches a visibility-toggle action when clicked", () => {
		// Spy must be installed BEFORE the connected component mounts because
		// react-redux's bindActionCreators captures dispatch at mount time.
		const store = createStore((s: any) => s, {});
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(<ItemVisibilityButtonWrap value="layer" />, {store});
		const root = container.querySelector(".ItemVisibilityButton") as HTMLDivElement;
		fireEvent.click(root);
		expect(dispatchSpy).toHaveBeenCalled();
	});
});
