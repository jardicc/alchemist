/**
 * @jest-environment jsdom
 */
import React from "react";
import {fireEvent, screen} from "@testing-library/react";
import "@testing-library/jest-dom";

// ---- Mocks for heavy / side-effecting children ----
jest.mock("../FiltersContainer", () => ({}), {virtual: true}); // just in case
jest.mock("../Filters", () => {
	const React = require("react");
	return {Filters: () => React.createElement("div", {"data-testid": "filters-stub"})};
});

jest.mock("../DescriptorItem", () => {
	const React = require("react");
	return {
		DescriptorItem: (props: any) =>
			React.createElement("div", {
				"data-testid": "descriptor-item",
				"data-id": props.descriptor.id,
			}, props.descriptor.title),
	};
});

jest.mock("../../classes/Listener", () => ({
	ListenerClass: {
		startListener: jest.fn(),
		stopListener: jest.fn(),
		startSpy: jest.fn(),
		stopSpy: jest.fn(),
		startInspector: jest.fn(),
		stopInspector: jest.fn(),
	},
}));

jest.mock("../../classes/GetInfo", () => ({
	GetInfo: {
		getAM: jest.fn().mockResolvedValue(null),
		generateTitle: () => "title",
	},
}));

jest.mock("../../classes/Helpers", () => ({
	Helpers: {uuidCustom: () => "mock-uuid"},
	replayDescriptor: jest.fn(),
}));

jest.mock("../../classes/guessOriginalReference", () => ({
	guessOriginalReference: jest.fn().mockReturnValue(null),
}));

jest.mock("../../classes/RawDataConverter", () => ({
	RawDataConverter: {
		replaceArrayBuffer: (x: any) => x,
	},
}));

jest.mock("../../classes/filterNonExistent", () => ({
	filterNonExistent: (x: any) => x,
}));

jest.mock("react-notifications", () => ({
	NotificationManager: {error: jest.fn(), success: jest.fn()},
}));

jest.mock("crc-32", () => ({
	str: () => 0,
}));

jest.mock("../../../shared/classes/Main", () => ({
	Main: {devMode: false, isFirstParty: false, privileged: false},
}));

// Stub all icon components to nothing.
jest.mock("../../../shared/components/icons", () => new Proxy({}, {get: () => () => null}));

import {LeftColumn} from "../LeftColumn";
import {ListenerClass} from "../../classes/Listener";
import {renderWithStore} from "../../../__tests__/renderWithStore";
import {configureStore} from "@reduxjs/toolkit";

// ---- Selector mocks so the component can read from them ----
// Use jest.fn() so individual tests can override via mockReturnValue
jest.mock("../../selectors/inspectorSelectors", () => ({
	getTargetReference: jest.fn(() => ({})),
	getActiveRef: jest.fn(() => ({type: "layer"})),
	getCopyToClipboardEnabled: jest.fn(() => false),
	getAddAllowed: jest.fn(() => true),
	getAllDescriptors: jest.fn(() => []),
	getDescriptorsListView: jest.fn(() => []),
	getLockedSelection: jest.fn(() => false),
	getPinnedSelection: jest.fn(() => false),
	getRanameEnabled: jest.fn(() => false),
	getReplayEnabled: jest.fn(() => false),
	getSelectedDescriptors: jest.fn(() => []),
	getSelectedDescriptorsUUID: jest.fn(() => []),
	getRemovableSelection: jest.fn(() => true),
	getHasAutoActiveDescriptor: jest.fn(() => false),
	getAutoUpdate: jest.fn(() => false),
	getInspectorSettings: jest.fn(() => ({
		autoUpdateListener: false, autoUpdateInspector: false, autoUpdateSpy: false,
		searchTerm: "", groupDescriptors: "off", dontShowMarketplaceInfo: true,
		neverRecordActionNames: [], initialDescriptorSettings: {}, maximumItems: 100,
		fontSize: "size-default", makeRawDataEasyToInspect: false, accordionExpandedIDs: [],
	})),
}));
jest.mock("../../selectors/inspectorCodeSelectors", () => ({
	getGeneratedCode: jest.fn(() => ""),
}));

import {
	getAddAllowed, getDescriptorsListView, getReplayEnabled,
	getSelectedDescriptorsUUID, getInspectorSettings,
} from "../../selectors/inspectorSelectors";

const baseSettings = (over: Partial<any> = {}): any => ({
	autoUpdateListener: false,
	autoUpdateInspector: false,
	autoUpdateSpy: false,
	searchTerm: "",
	groupDescriptors: "off",
	dontShowMarketplaceInfo: true,
	neverRecordActionNames: [],
	initialDescriptorSettings: {},
	maximumItems: 100,
	fontSize: "size-default",
	makeRawDataEasyToInspect: false,
	accordionExpandedIDs: [],
	...over,
});

const makeDescriptor = (id: string, over: Partial<any> = {}): any => ({
	id,
	selected: false,
	crc: 0,
	startTime: 0,
	endTime: 0,
	pinned: false,
	locked: false,
	renameMode: false,
	title: `desc-${id}`,
	originalReference: {type: "layer"},
	playAbleData: null,
	recordedData: null,
	descriptorSettings: {},
	...over,
});

const baseProps = (over: Partial<any> = {}): any => ({
	activeRef: {type: "layer"},
	addAllowed: true,
	allDescriptors: [],
	allInViewDescriptors: [],
	autoUpdate: false,
	hasAutoActiveDescriptor: false,
	lockedSelection: false,
	pinnedSelection: false,
	removableSelection: false,
	renameEnabled: false,
	replayEnabled: false,
	generatedCode: "",
	copyToClipboardEnabled: false,
	selectedDescriptors: [],
	selectedDescriptorsUUIDs: [],
	settings: baseSettings(),
	onAddDescriptor: jest.fn(),
	onSelect: jest.fn(),
	onClear: jest.fn(),
	onPin: jest.fn(),
	onRemove: jest.fn(),
	onLock: jest.fn(),
	setListener: jest.fn(),
	setSpy: jest.fn(),
	setAutoInspector: jest.fn(),
	setSearchTerm: jest.fn(),
	setRenameMode: jest.fn(),
	onSetDontShowMarketplaceInfo: jest.fn(),
	toggleDescGrouping: jest.fn(),
	onClearView: jest.fn(),
	onClearNonExistent: jest.fn(),
	...over,
});

describe("<LeftColumn />", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Restore selector defaults after clearAllMocks
		(getAddAllowed as jest.Mock).mockReturnValue(true);
		(getDescriptorsListView as jest.Mock).mockReturnValue([]);
		(getReplayEnabled as jest.Mock).mockReturnValue(false);
		(getSelectedDescriptorsUUID as jest.Mock).mockReturnValue([]);
		(getInspectorSettings as jest.Mock).mockReturnValue(baseSettings());
	});

	it("renders the Filters slot and the action buttons", () => {
		renderWithStore(<LeftColumn />, {preloadedState: {}});
		expect(screen.getByTestId("filters-stub")).toBeInTheDocument();
		expect(screen.getByText(/^Add$/)).toBeInTheDocument();
		expect(screen.getByText(/Listener/)).toBeInTheDocument();
		expect(screen.getByText(/Inspector/)).toBeInTheDocument();
	});

	it("renders one DescriptorItem per visible descriptor", () => {
		(getDescriptorsListView as jest.Mock).mockReturnValue([makeDescriptor("a"), makeDescriptor("b"), makeDescriptor("c")]);
		renderWithStore(<LeftColumn />, {preloadedState: {}});
		expect(screen.getAllByTestId("descriptor-item")).toHaveLength(3);
	});

	it("Add button gets 'allowed' class when addAllowed=true", () => {
		(getAddAllowed as jest.Mock).mockReturnValue(true);
		const {container} = renderWithStore(<LeftColumn />, {preloadedState: {}});
		const add = container.querySelector(".add");
		expect(add?.className).toContain("allowed");
		expect(add?.className).not.toContain("disallowed");
	});

	it("Add button gets 'disallowed' class when addAllowed=false", () => {
		(getAddAllowed as jest.Mock).mockReturnValue(false);
		const {container} = renderWithStore(<LeftColumn />, {preloadedState: {}});
		expect(container.querySelector(".add")?.className).toContain("disallowed");
	});

	it("Search field renders without crashing", () => {
		const {container} = renderWithStore(<LeftColumn />, {preloadedState: {}});
		const search = container.querySelector(".search input, .search sp-textfield") as HTMLElement | null;
		const target = search ?? container.querySelector(".search")!;
		fireEvent.input(target, {target: {value: "abc", currentTarget: {value: "abc"}}} as any);
		expect(container.querySelector(".search")).not.toBeNull();
	});

	it("Replay button is disallowed when replayEnabled=false", () => {
		(getReplayEnabled as jest.Mock).mockReturnValue(false);
		const {container} = renderWithStore(<LeftColumn />, {preloadedState: {}});
		expect(container.querySelector(".play")?.className).toContain("disallowed");
	});

	it("Remove button dispatches removeDescAction with selectedDescriptorsUUIDs", () => {
		(getSelectedDescriptorsUUID as jest.Mock).mockReturnValue(["x"]);
		const store = configureStore({
			reducer: (s: any = {}) => s,
			preloadedState: {},
			middleware: (g) => g({serializableCheck: false, immutableCheck: false, thunk: false}),
		});
		const dispatchSpy = jest.spyOn(store, "dispatch");
		const {container} = renderWithStore(<LeftColumn />, {store});
		fireEvent.click(container.querySelector(".remove")!);
		expect(dispatchSpy).toHaveBeenCalledWith(
			expect.objectContaining({payload: ["x"]}),
		);
	});

	it("Listener button toggles ListenerClass.startListener when off", async () => {
		(getInspectorSettings as jest.Mock).mockReturnValue(baseSettings({autoUpdateListener: false}));
		const {container} = renderWithStore(<LeftColumn />, {preloadedState: {}});
		await fireEvent.click(container.querySelector(".listenerSwitch")!);
		expect(
			(ListenerClass.startListener as jest.Mock).mock.calls.length,
		).toBeGreaterThan(0);
	});

	it("Listener button stops listening when already auto-updating", async () => {
		(getInspectorSettings as jest.Mock).mockReturnValue(baseSettings({autoUpdateListener: true}));
		const {container} = renderWithStore(<LeftColumn />, {preloadedState: {}});
		await fireEvent.click(container.querySelector(".listenerSwitch")!);
		expect(ListenerClass.stopListener).toHaveBeenCalled();
	});
});
