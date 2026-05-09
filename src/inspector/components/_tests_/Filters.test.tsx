/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, within} from "@testing-library/react";
import "@testing-library/jest-dom";

// Stub the redux-connected children so we can render <Filters /> in isolation
// and just count how many filter rows appear for a given activeRef.type.
jest.mock("../FilterRow", () => {
	const React = require("react");
	const FilterRowContainer = (props: any) =>
		React.createElement("div", {
			"data-testid": "filter-row",
			"data-subtype": props.subtype,
			"data-header": typeof props.header === "string" ? props.header : "",
		});
	return {FilterRowContainer};
});

jest.mock("../ListenerFilterContainer", () => {
	const React = require("react");
	return {
		ListenerFilterContainer: () =>
			React.createElement("div", {"data-testid": "listener-filter-stub"}),
	};
});

jest.mock("../ItemVisibilityButton", () => ({
	ItemVisibilityButtonWrap: () => null,
}));

jest.mock("../../classes/GetList", () => ({
	GetList: {
		getDocuments: jest.fn(),
		getLayers: jest.fn(),
		getChannels: jest.fn(),
		getPaths: jest.fn(),
		getActionSets: jest.fn(),
		getActionItem: jest.fn(),
		getActionCommands: jest.fn(),
		getGuides: jest.fn(),
		getHistory: jest.fn(),
		getSnapshots: jest.fn(),
	},
}));

import {Filters} from "../Filters";

const baseProps = (over: Partial<any> = {}): any => ({
	activeRef: {type: "document", documentID: "active", filterDoc: "off"},
	filterBySelectedReferenceType: "off",
	activeRefProperties: {type: "document", list: []},
	onSetSelectedReferenceType: jest.fn(),
	onSetTargetReference: jest.fn(),
	onSetProperty: jest.fn(),
	...over,
});

const subtypes = (container: HTMLElement): string[] =>
	within(container).queryAllByTestId("filter-row").map(el =>
		el.getAttribute("data-subtype") ?? "",
	);

describe("<Filters />", () => {
	it("renders the Type/main filter row first", () => {
		const {container} = render(<Filters {...baseProps()} />);
		const list = subtypes(container);
		expect(list[0]).toBe("main");
	});

	it("renders document + property rows for type='document'", () => {
		const {container} = render(<Filters {...baseProps({activeRef: {type: "document", documentID: "active", filterDoc: "off", properties: [], filterProp: "off"}})} />);
		const list = subtypes(container);
		expect(list).toContain("documentID");
		expect(list).toContain("properties");
	});

	it("renders layer-related rows for type='layer'", () => {
		const props = baseProps({
			activeRef: {
				type: "layer",
				documentID: "active",
				layerID: "selected",
				filterDoc: "off",
				filterLayer: "off",
				properties: [],
				filterProp: "off",
			},
		});
		const {container} = render(<Filters {...props} />);
		const list = subtypes(container);
		expect(list).toEqual(expect.arrayContaining(["main", "documentID", "layerID", "properties"]));
	});

	it("renders the action chain for type='actions' with non-'none' IDs", () => {
		const props = baseProps({
			activeRef: {
				type: "actions",
				actionSetID: 1,
				actionID: 2,
				commandIndex: 3,
				filterActionSet: "off",
				filterAction: "off",
				filterCommand: "off",
				properties: [],
				filterProp: "off",
			},
		});
		const {container} = render(<Filters {...props} />);
		const list = subtypes(container);
		expect(list).toEqual(expect.arrayContaining(["actionSetID", "actionID", "commandIndex"]));
	});

	it("hides actionID & commandIndex when actionSetID is 'none'", () => {
		const props = baseProps({
			activeRef: {
				type: "actions",
				actionSetID: "none",
				actionID: "none",
				commandIndex: "none",
				filterActionSet: "off",
				filterAction: "off",
				filterCommand: "off",
				properties: [],
				filterProp: "off",
			},
		});
		const {container} = render(<Filters {...props} />);
		const list = subtypes(container);
		expect(list).toContain("actionSetID");
		expect(list).not.toContain("actionID");
		expect(list).not.toContain("commandIndex");
	});

	it("renders ListenerFilter when type='listener'", () => {
		const props = baseProps({
			activeRef: {type: "listener"},
			activeRefProperties: undefined,
		});
		const {getByTestId} = render(<Filters {...props} />);
		expect(getByTestId("listener-filter-stub")).toBeInTheDocument();
	});

	it("does NOT render Property row for ref types without properties", () => {
		const props = baseProps({
			activeRef: {type: "dispatcher"},
			activeRefProperties: undefined,
		});
		const {container} = render(<Filters {...props} />);
		expect(subtypes(container)).not.toContain("properties");
	});
});
