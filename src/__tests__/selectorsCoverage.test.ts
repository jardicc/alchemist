/**
 * @jest-environment jsdom
 *
 * Coverage-driving tests for selectors that aren't exercised by
 * selectorsMigration.test.ts. These tests focus on the remaining
 * exports of `inspector/selectors/inspectorSelectors.ts` and a few
 * extra branches in the atn/sor selector modules.
 */

jest.mock("../inspector/classes/Settings", () => ({
	Settings: {
		importState: (): null => null,
		saveSettings: jest.fn().mockResolvedValue(undefined),
		setSpectrumComponentSize: jest.fn(),
	},
}));
jest.mock("../inspector/classes/Listener", () => ({
	ListenerClass: {
		startListener: jest.fn(),
		stopListener: jest.fn(),
		startSpy: jest.fn(),
		stopSpy: jest.fn(),
		startInspector: jest.fn(),
		stopInspector: jest.fn(),
	},
}));

import {getInitialState} from "../inspector/inspInitialState";
import {inspectorReducer} from "../inspector/reducers/reducer";
import {IInspectorState, IDescriptor} from "../inspector/model/types";
import {IRootState} from "../shared/store";
import {IActionSetUUID} from "../atnDecoder/atnModel";
import {inspectorSlice} from "../inspector/inspectorSlice";
import {atnSlice} from "../atnDecoder/atnSlice";
import {sorSlice} from "../sorcerer/sorSlice";

const {
	addDescriptor,
	lockDesc,
	pinDesc,
	selectDescriptor,
	setColumnSize,
	setFilterState,
	setListenerNotifierFilter,
	setModeTab,
	setNeverRecordActionNames,
	setSelectedReferenceType,
	setSettings,
	toggleDescriptorsGrouping,
	setSearchTerm,
} = inspectorSlice.actions;

const {
	setData,
	selectAction,
	expandAction,
} = atnSlice.actions;

const {
	make,
	select,
} = sorSlice.actions;

import * as Insp from "../inspector/selectors/inspectorSelectors";
import * as Atn from "../atnDecoder/atnSelectors";
import * as Sor from "../sorcerer/sorSelectors";

let _crc = 9000;
function desc(id: string, overrides: Partial<IDescriptor> = {}): IDescriptor {
	_crc += 1;
	return {
		id,
		crc: _crc,
		title: id,
		selected: false,
		locked: false,
		pinned: false,
		startTime: 0,
		endTime: 0,
		renameMode: false,
		originalReference: {type: "layer"} as any,
		originalData: {} as any,
		recordedData: {_obj: "make"} as any,
		calculatedReference: null,
		groupCalculatedReference: null,
		descriptorSettings: {supportRawDataType: "auto"} as any,
		...overrides,
	} as unknown as IDescriptor;
}

function atnSet(uuid: string): IActionSetUUID {
	return {
		__uuid__: uuid,
		actionSetName: uuid,
		actionItems: [],
		expanded: true,
		isOn: true,
	} as unknown as IActionSetUUID;
}

function asRoot(inspector: IInspectorState): IRootState {
	return {inspector};
}

function reduceAll(actions: Array<Parameters<typeof inspectorReducer>[1]>): IInspectorState {
	return actions.reduce<IInspectorState>(
		(s, a) => inspectorReducer(s, a),
		getInitialState(),
	);
}

// ---------------------------------------------------------------------------
// Simple property selectors
// ---------------------------------------------------------------------------

describe("inspectorSelectors â€“ simple slices", () => {
	test("getFilterBySelectedReferenceType / getTargetReference / getAutoUpdate", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
		]));
		// SET_FILTER_STATE("main", "off") -> reducer toggles flag to "on"
		expect(Insp.getFilterBySelectedReferenceType(root)).toBe("on");
		expect(Insp.getTargetReference(root)).toBe(root.inspector.targetReference);
		expect(Insp.getAutoUpdate(root)).toBe(root.inspector.settings.autoUpdateInspector);
	});

	test("getPropertySettings returns the settings.properties array", () => {
		const root = asRoot(getInitialState());
		expect(Insp.getPropertySettings(root)).toBe(root.inspector.settings.properties);
		expect(Array.isArray(Insp.getPropertySettings(root))).toBe(true);
	});

	test("getLeftColumnWidth / getRightColumnWidth reflect SET_COLUMN_SIZE", () => {
		const root = asRoot(reduceAll([
			setColumnSize(450, "left"),
			setColumnSize(123, "right"),
		]));
		expect(Insp.getLeftColumnWidth(root)).toBe(450);
		expect(Insp.getRightColumnWidth(root)).toBe(123);
	});

	test("getNeverRecordActionNames reflects setNeverRecordActionNames", () => {
		const root = asRoot(reduceAll([
			setNeverRecordActionNames("a\nb\nc"),
		]));
		expect(Insp.getNeverRecordActionNames(root)).toEqual(["a", "b", "c"]);
	});

	test("getPropertiesListForActiveRef returns settings for the active ref type", () => {
		const root = asRoot(reduceAll([setSelectedReferenceType("layer")]));
		const settings = Insp.getPropertiesListForActiveRef(root);
		expect(settings?.type).toBe("layer");
	});
});

// ---------------------------------------------------------------------------
// getListenerNotifierFilterSettings â€“ has 3 branches incl. throw
// ---------------------------------------------------------------------------

describe("getListenerNotifierFilterSettings", () => {
	test("returns listenerFilter for listener", () => {
		const root = asRoot(reduceAll([setSelectedReferenceType("listener")]));
		expect(Insp.getListenerNotifierFilterSettings(root)).toBe(
			root.inspector.settings.listenerFilter,
		);
	});

	test("returns notifierFilter for notifier", () => {
		const root = asRoot(reduceAll([setSelectedReferenceType("notifier")]));
		expect(Insp.getListenerNotifierFilterSettings(root)).toBe(
			root.inspector.settings.notifierFilter,
		);
	});

	test("throws for any other reference type", () => {
		const root = asRoot(reduceAll([setSelectedReferenceType("layer")]));
		expect(() => Insp.getListenerNotifierFilterSettings(root)).toThrow();
	});
});

// ---------------------------------------------------------------------------
// getDescriptorsListView â€“ exercise filter / search / group / listener branches
// ---------------------------------------------------------------------------

describe("getDescriptorsListView", () => {
	beforeEach(() => {
		// silence the console.log inside getDescriptorsListView so the test
		// output stays readable.
		jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	test("rootFilter 'off' returns all descriptors (pinned moved to bottom)", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("a", {pinned: false}), false),
			addDescriptor(desc("b", {pinned: true}), false),
			addDescriptor(desc("c", {pinned: false}), false),
		]));
		const view = Insp.getDescriptorsListView(root);
		expect(view.map(d => d.id)).toEqual(["a", "c", "b"]);
	});

	test("searchTerm filters by title (case-insensitive)", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("Alpha"), false),
			addDescriptor(desc("Beta"), false),
			addDescriptor(desc("Bravo"), false),
			setSearchTerm("b"),
		]));
		const ids = Insp.getDescriptorsListView(root).map(d => d.id);
		expect(ids.sort()).toEqual(["Beta", "Bravo"]);
	});

	test("grouping=strict collapses duplicate-crc rows and increments groupCount", () => {
		// Two descriptors with the SAME crc -> collapsed.
		const dup1 = desc("d1");
		const dup2: IDescriptor = {...desc("d2"), crc: dup1.crc};
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			toggleDescriptorsGrouping("strict"),
			addDescriptor(dup1, false),
			addDescriptor(dup2, false),
		]));
		const view = Insp.getDescriptorsListView(root);
		expect(view).toHaveLength(1);
		expect(view[0].groupCount).toBe(2);
	});

	test("listener exclude filter drops matching recordedData._obj", () => {
		const root = asRoot(reduceAll([
			setSelectedReferenceType("listener"),
			setFilterState("listener", "main", "on"),
			setListenerNotifierFilter({type: "exclude", exclude: ["make"], include: []}),
			toggleDescriptorsGrouping("none"),
			addDescriptor(desc("keep", {recordedData: {_obj: "open"} as any, originalReference: {type: "listener"} as any}), false),
			addDescriptor(desc("drop", {recordedData: {_obj: "make"} as any, originalReference: {type: "listener"} as any}), false),
		]));
		const ids = Insp.getDescriptorsListView(root).map(d => d.id);
		expect(ids).toEqual(["keep"]);
	});

	test("listener include filter keeps only matching recordedData._obj", () => {
		const root = asRoot(reduceAll([
			setSelectedReferenceType("listener"),
			setFilterState("listener", "main", "on"),
			setListenerNotifierFilter({type: "include", exclude: [], include: ["make"]}),
			toggleDescriptorsGrouping("none"),
			addDescriptor(desc("keep", {recordedData: {_obj: "make"} as any, originalReference: {type: "listener"} as any}), false),
			addDescriptor(desc("drop", {recordedData: {_obj: "open"} as any, originalReference: {type: "listener"} as any}), false),
		]));
		const ids = Insp.getDescriptorsListView(root).map(d => d.id);
		expect(ids).toEqual(["keep"]);
	});
});

// ---------------------------------------------------------------------------
// auto-active / replay / add-allowed
// ---------------------------------------------------------------------------

describe("auto-active descriptors and derived flags", () => {
	beforeEach(() => {
		jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	test("getActiveDescriptors returns descriptors with selected=true", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			addDescriptor(desc("d2"), false),
			selectDescriptor("replace", "d2"),
		]));
		expect(Insp.getActiveDescriptors(root).map(d => d.id)).toEqual(["d2"]);
	});

	test("getAutoActiveDescriptor picks the last item when nothing is selected", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			addDescriptor(desc("d2"), false),
			addDescriptor(desc("d3"), false),
		]));
		expect(Insp.getAutoActiveDescriptor(root)?.id).toBe("d3");
		expect(Insp.getHasAutoActiveDescriptor(root)).toBe(true);
	});

	test("getAutoActiveDescriptor returns null when there is an explicit selection", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Insp.getAutoActiveDescriptor(root)).toBeNull();
		expect(Insp.getHasAutoActiveDescriptor(root)).toBe(false);
	});

	test("getSecondaryAutoActiveDescriptor picks the second-to-last item", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
		]));
		expect(Insp.getSecondaryAutoActiveDescriptor(root)?.id).toBe("a");
	});

	test("getAutoSelectedUUIDs in difference mode returns both primary and secondary", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setModeTab("difference"),
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
		]));
		expect(Insp.getAutoSelectedUUIDs(root).sort()).toEqual(["a", "b"]);
	});

	test("getAutoSelectedUUIDs outside difference mode returns only primary", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setModeTab("content"),
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
		]));
		expect(Insp.getAutoSelectedUUIDs(root)).toEqual(["b"]);
	});

	test("getActiveDescriptorOriginalReference: '>1', '==1', auto, 'add some'", () => {
		// none -> "Add some descriptor"
		const empty = asRoot(getInitialState());
		expect(Insp.getActiveDescriptorOriginalReference(empty)).toBe("Add some descriptor");

		// auto-active -> json of the last item
		const auto = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
		]));
		expect(Insp.getActiveDescriptorOriginalReference(auto)).toContain('"type"');

		// one selected -> json
		const one = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Insp.getActiveDescriptorOriginalReference(one)).toContain('"type"');

		// more than one selected -> hint
		const many = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			addDescriptor(desc("d2"), false),
			selectDescriptor("replace", "d1"),
			selectDescriptor("add", "d2"),
		]));
		expect(Insp.getActiveDescriptorOriginalReference(many)).toBe("Select 1 descriptor");
	});

	test("getReplayEnabled / getCopyToClipboardEnabled", () => {
		// nothing selected -> false
		const empty = asRoot(getInitialState());
		expect(Insp.getReplayEnabled(empty)).toBe(false);
		expect(Insp.getCopyToClipboardEnabled(empty)).toBe(false);

		// selected non-replies descriptor -> true
		const ok = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Insp.getReplayEnabled(ok)).toBe(true);
		expect(Insp.getCopyToClipboardEnabled(ok)).toBe(true);

		// selected "replies" descriptor -> false
		const replies = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1", {originalReference: {type: "replies"} as any}), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Insp.getReplayEnabled(replies)).toBe(false);
	});

	test("getRanameEnabled is true only for a single, ungrouped selected row", () => {
		// 0 selected -> false
		expect(Insp.getRanameEnabled(asRoot(getInitialState()))).toBe(false);

		// 1 selected -> true
		const one = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Insp.getRanameEnabled(one)).toBe(true);

		// 2 selected -> false
		const two = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			addDescriptor(desc("d2"), false),
			selectDescriptor("replace", "d1"),
			selectDescriptor("add", "d2"),
		]));
		expect(Insp.getRanameEnabled(two)).toBe(false);
	});

	test("getAddAllowed: true for normal layer ref, false for listener/dispatcher/notifier/replies, true for generator", () => {
		const layer = asRoot(reduceAll([setSelectedReferenceType("layer")]));
		expect(Insp.getAddAllowed(layer)).toBe(true);

		const listener = asRoot(reduceAll([setSelectedReferenceType("listener")]));
		expect(Insp.getAddAllowed(listener)).toBe(false);

		const dispatcher = asRoot(reduceAll([setSelectedReferenceType("dispatcher")]));
		expect(Insp.getAddAllowed(dispatcher)).toBe(false);

		const inspector = asRoot(reduceAll([setSelectedReferenceType("notifier")]));
		expect(Insp.getAddAllowed(inspector)).toBe(false);

		const replies = asRoot(reduceAll([setSelectedReferenceType("replies")]));
		expect(Insp.getAddAllowed(replies)).toBe(false);

		const generator = asRoot(reduceAll([setSelectedReferenceType("generator")]));
		expect(Insp.getAddAllowed(generator)).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// memoization on a couple of selectors that aren't covered in the migration test
// ---------------------------------------------------------------------------

describe("memoization sanity (additional selectors)", () => {
	test("getDescriptorsListView returns the same reference for the same state", () => {
		const state = reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
		]);
		const root = asRoot(state);
		jest.spyOn(console, "log").mockImplementation(() => undefined);
		expect(Insp.getDescriptorsListView(root)).toBe(Insp.getDescriptorsListView(root));
	});

	test("getAddAllowed memoizes on same state reference", () => {
		const root = asRoot(reduceAll([setSelectedReferenceType("layer")]));
		expect(Insp.getAddAllowed(root)).toBe(Insp.getAddAllowed(root));
	});
});

// ---------------------------------------------------------------------------
// Extra atn / sor coverage
// ---------------------------------------------------------------------------

describe("atn selectors â€“ additional branches", () => {
	test("getSetByUUID returns null for unknown uuid", () => {
		const root = asRoot(reduceAll([setData([atnSet("alpha")])]));
		expect(Atn.getSetByUUID(root.inspector, "alpha")?.__uuid__).toBe("alpha");
		expect(Atn.getSetByUUID(root.inspector, "nope")).toBeNull();
	});

	test("getTextData reports 'bored' when there is no data", () => {
		const root = asRoot(getInitialState());
		expect(Atn.getTextData(root)).toMatch(/bored/i);
	});

	test("getTextData reports 'select some item' when data exists but nothing is selected", () => {
		const root = asRoot(reduceAll([setData([atnSet("alpha")])]));
		expect(Atn.getTextData(root)).toMatch(/select some item/i);
	});

	test("getLastSelected returns the selected set", () => {
		const root = asRoot(reduceAll([
			setData([atnSet("alpha"), atnSet("beta")]),
			expandAction(["alpha"], true, false),
			selectAction("replace", ["alpha"]),
		]));
		const last = Atn.getLastSelected(root);
		expect(last?.__uuid__).toBe("alpha");
	});
});

describe("sor selectors â€“ additional branches", () => {
	test("getActiveCommand / getActivePanel return null with general selection, value after select", () => {
		const general = asRoot(getInitialState());
		expect(Sor.getActiveCommand(general)).toBeNull();
		expect(Sor.getActivePanel(general)).toBeNull();

		const s0 = getInitialState();
		const cmdUuid = (s0.sorcerer.manifestInfo.entrypoints.find(e => e.type === "command") as any).$$$uuid;
		const panelUuid = (s0.sorcerer.manifestInfo.entrypoints.find(e => e.type === "panel") as any).$$$uuid;

		const cmd = asRoot(inspectorReducer(s0, select("command", cmdUuid)));
		expect((Sor.getActiveCommand(cmd) as any)?.$$$uuid).toBe(cmdUuid);

		const panel = asRoot(inspectorReducer(s0, select("panel", panelUuid)));
		expect((Sor.getActivePanel(panel) as any)?.$$$uuid).toBe(panelUuid);
	});

	test("getActiveItem falls back to {type:'general'} for the generic selection", () => {
		const root = asRoot(getInitialState());
		expect(Sor.getActiveItem(root)).toEqual({type: "general"});
	});

	test("getManifestCode returns a JSON string containing the manifest name field", () => {
		const root = asRoot(getInitialState());
		const code = Sor.getManifestCode(root);
		expect(typeof code).toBe("string");
		expect(code).toMatch(/"name"\s*:/);
	});

	test("generateScriptFileCode / generateHtmlFileCode return strings", () => {
		const root = asRoot(reduceAll([
			make("snippet"),
			make("command"),
			make("panel"),
		]));
		expect(typeof Sor.generateScriptFileCode(root)).toBe("string");
		expect(typeof Sor.generateHtmlFileCode(root)).toBe("string");
	});
});

// ---------------------------------------------------------------------------
// extra: lock/pin/select integration with the simple selectors covered above
// ---------------------------------------------------------------------------

describe("selection-derived flags â€“ additional combinations", () => {
	test("locked but not selected -> getLockedSelection is false", () => {
		const root = asRoot(reduceAll([
			addDescriptor(desc("d1"), false),
			lockDesc(true, ["d1"]),
		]));
		expect(Insp.getLockedSelection(root)).toBe(false);
		expect(Insp.getRemovableSelection(root)).toBe(true);
	});

	test("pinned but not selected -> getPinnedSelection is false", () => {
		const root = asRoot(reduceAll([
			addDescriptor(desc("d1"), false),
			pinDesc(true, ["d1"]),
		]));
		expect(Insp.getPinnedSelection(root)).toBe(false);
	});

	test("setSettings merges partial settings (getInspectorSettings shows it)", () => {
		const root = asRoot(reduceAll([
			setSettings({maximumItems: 42} as any),
		]));
		expect(Insp.getInspectorSettings(root).maximumItems).toBe(42);
	});
});
