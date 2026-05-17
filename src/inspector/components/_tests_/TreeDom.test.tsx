/**
 * @jest-environment jsdom
 */
import React from "react";
import {render} from "@testing-library/react";
import "@testing-library/jest-dom";

// Heavy children: stub them out so we test only TreeDom branches.
jest.mock("../react-json-tree-2", () => ({
	JSONTree: () => <div data-testid="json-tree" />,
}));
jest.mock("../TreePath", () => ({
	TreePath: () => <div data-testid="tree-path" />,
}));

// Stub DOM selectors so the component receives controlled values
// instead of going through ReferenceToDOM which requires a real PS host.
let _mockContent: any = null;
jest.mock("../../selectors/inspectorDOMSelectors", () => ({
	getTreeDomInstance: () => _mockContent,
	getDomPath: () => [],
	getDomExpandedNodes: () => [],
	getDOMExpandLevel: () => 0,
}));

import {TreeDom} from "../TreeDom";
import {getItemString} from "../TreeDiff/getItemString";
import {renderWithStore} from "../../../__tests__/renderWithStore";

const minimalState: any = {inspector: {descriptors: [], selectedReferenceType: "layer", filterBySelectedReferenceType: "off", explicitlyVisibleTopCategories: [], targetReference: {layer: {type: "layer", filterProp: "off", properties: [], documentID: "selected", filterDoc: "off", filterLayer: "off", layerID: "selected"}}, settings: {searchTerm: null, listenerFilter: {type: "none", exclude: [], include: []}, notifierFilter: {type: "none", exclude: [], include: []}, autoUpdateInspector: false, activeDescriptors: [], accordionExpandedIDs: []}, inspector: {activeTab: "content", content: {viewType: "tree", search: "", treePath: [], autoExpandLevels: 0, expandedTree: []}, dom: {treePath: [], autoExpandLevels: 0, expandedTree: []}, difference: {viewType: "tree", treePath: [], autoExpandLevels: 0, expandedTree: []}}}};

describe("<TreeDom />", () => {
	it("renders a 'nothing to see' message when content is null/undefined", () => {
		_mockContent = null;
		const {container} = renderWithStore(<TreeDom />, {preloadedState: minimalState});
		expect(container.textContent).toContain("Nothing to see there");
	});

	it("renders the TreePath and JSONTree when content is present", () => {
		_mockContent = {hello: "world"};
		const {getByTestId} = renderWithStore(<TreeDom />, {preloadedState: minimalState});
		expect(getByTestId("tree-path")).toBeInTheDocument();
		expect(getByTestId("json-tree")).toBeInTheDocument();
	});

	it("wraps a primitive content into a noPin object so JSONTree can be rendered", () => {
		_mockContent = 7;
		const {getByTestId} = renderWithStore(<TreeDom />, {preloadedState: minimalState});
		// Should still render JSONTree without throwing
		expect(getByTestId("json-tree")).toBeInTheDocument();
	});

	it("getItemString delegates to the shared item string helper", () => {
		const out = getItemString("Object", {a: 1}, true, false);
		expect(React.isValidElement(out)).toBe(true);
	});
});
