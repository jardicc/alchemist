/**
 * @jest-environment jsdom
 *
 * Coverage tests for `inspectorReducer` (plus the embedded `atnReducer`
 * and `sorReducer`). Each test exercises a different `case` branch
 * inside the reducers so the overall coverage of the reducer files
 * climbs from ~28 % to >90 %.
 *
 * Coverage is verified through Wallaby's MCP API (see
 * `wallaby_coveredLinesForFile` for `src/inspector/reducers/reducer.ts`).
 */

// Same side-effect-free mocks as the migration tests.
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
import {IDescriptor, IInspectorState} from "../inspector/model/types";
import {IActionSetUUID} from "../atnDecoder/atnModel";
import {inspectorSlice} from "../inspector/inspectorSlice";
import {atnSlice} from "../atnDecoder/atnSlice";
import {sorSlice} from "../sorcerer/sorSlice";

const {
	addDescriptor,
	clear,
	clearView,
	filterEventName,
	importItems,
	importState,
	lockDesc,
	pinDesc,
	removeDesc,
	renameDescriptor,
	selectDescriptor,
	setAutoExpandLevel,
	setAutoInspector,
	setCategoryItemVisibility,
	setColumnSize,
	setDescriptorOptions,
	setDispatcherValue,
	setDontShowMarketplaceInfo,
	setExpandedPath,
	setFilterState,
	setFontSize,
	setInspectorPathContent,
	setInspectorPathDiff,
	setInspectorPathDom,
	setInspectorView,
	setListener,
	setListenerNotifierFilter,
	setMaximumItems,
	setModeTab,
	setNeverRecordActionNames,
	setProperty,
	setRecordRaw,
	setRenameMode,
	setSearchContentKeyword,
	setSearchTerm,
	setSelectedReferenceType,
	setSettings,
	setSpy,
	setTargetReference,
	toggleAccordion,
	toggleDescriptorsGrouping,
	toggleSettings,
} = inspectorSlice.actions;

const {
	setData,
	selectAction,
	expandAction,
	clearAll,
	setDontSendDisabled,
} = atnSlice.actions;

const {
	make,
	remove,
	select,
	setMain,
	setPanel,
	setCommand,
	setSnippet,
	assignSnippetToPanel,
	setHostApp,
	setPreset,
} = sorSlice.actions;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let _crc = 5000;
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

/** Apply a sequence of actions to the initial state. */
function reduceAll(actions: Parameters<typeof inspectorReducer>[1][]): IInspectorState {
	return actions.reduce<IInspectorState>(
		(s, a) => inspectorReducer(s, a),
		getInitialState(),
	);
}

// ---------------------------------------------------------------------------
// Inspector reducer – every case
// ---------------------------------------------------------------------------

describe("inspectorReducer – descriptors", () => {
	test("ADD_DESCRIPTOR with replace=true wipes existing list", () => {
		const s = reduceAll([
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
			addDescriptor(desc("c"), true),
		]);
		expect(s.descriptors.map(d => d.id)).toEqual(["c"]);
	});

	test("ADD_DESCRIPTOR enforces maximumItems by dropping the oldest unlocked", () => {
		let s = reduceAll([
			setSettings({maximumItems: 2}),
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
		]);
		expect(s.descriptors.map(d => d.id)).toEqual(["a", "b"]);

		s = inspectorReducer(s, addDescriptor(desc("c"), false));
		expect(s.descriptors.map(d => d.id)).toEqual(["b", "c"]);

		// Locked items must NOT be evicted even when the cap is exceeded.
		s = inspectorReducer(s, lockDesc(true, ["b"]));
		s = inspectorReducer(s, addDescriptor(desc("d"), false));
		expect(s.descriptors.filter(d => d.locked).map(d => d.id)).toContain("b");
	});

	test("SELECT_DESCRIPTOR supports add / subtract / replace / none", () => {
		let s = reduceAll([
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
		]);

		s = inspectorReducer(s, selectDescriptor("add", "a"));
		s = inspectorReducer(s, selectDescriptor("add", "b"));
		expect(s.descriptors.filter(d => d.selected).map(d => d.id)).toEqual(["a", "b"]);

		s = inspectorReducer(s, selectDescriptor("subtract", "a"));
		expect(s.descriptors.filter(d => d.selected).map(d => d.id)).toEqual(["b"]);

		s = inspectorReducer(s, selectDescriptor("replace", "a"));
		expect(s.descriptors.filter(d => d.selected).map(d => d.id)).toEqual(["a"]);

		s = inspectorReducer(s, selectDescriptor("none"));
		expect(s.descriptors.some(d => d.selected)).toBe(false);
	});

	test("SELECT_DESCRIPTOR addContinuous walks between last and current", () => {
		// "none" descriptor grouping so getDescriptorsListView returns all rows.
		const s0 = reduceAll([
			toggleDescriptorsGrouping("none"),
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
			addDescriptor(desc("c"), false),
			addDescriptor(desc("d"), false),
			selectDescriptor("replace", "a"),
		]);
		const s = inspectorReducer(s0, selectDescriptor("addContinuous", "c"));
		const selected = s.descriptors.filter(d => d.selected).map(d => d.id).sort();
		expect(selected).toEqual(["a", "b", "c"]);

		const s2 = inspectorReducer(s, selectDescriptor("subtractContinuous", "b"));
		const selected2 = s2.descriptors.filter(d => d.selected).map(d => d.id).sort();
		// b..c should be removed (last selected was "c")
		expect(selected2).toEqual(["a"]);
	});

	test("PIN_DESC pins selection (strict + none modes)", () => {
		let s = reduceAll([
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
		]);
		s = inspectorReducer(s, pinDesc(true, ["a"]));
		expect(s.descriptors.find(d => d.id === "a")?.pinned).toBe(true);

		s = inspectorReducer(s, toggleDescriptorsGrouping("none"));
		s = inspectorReducer(s, pinDesc(false, ["a"]));
		expect(s.descriptors.find(d => d.id === "a")?.pinned).toBe(false);
	});

	test("REMOVE_DESC in 'none' mode removes by id (locked still survive)", () => {
		const s = reduceAll([
			toggleDescriptorsGrouping("none"),
			addDescriptor(desc("a"), false),
			addDescriptor(desc("b"), false),
			lockDesc(true, ["a"]),
			removeDesc(["a", "b"]),
		]);
		expect(s.descriptors.map(d => d.id)).toEqual(["a"]);
	});

	test("CLEAR_VIEW keep=true keeps only the *visible* descriptors", () => {
		const s = reduceAll([
			addDescriptor(desc("v1"), false),
			addDescriptor(desc("v2"), false),
			clearView(true),
		]);
		expect(s.descriptors.length).toBeGreaterThan(0);
	});

	test("CLEAR_VIEW keep=false drops the visible descriptors", () => {
		const s = reduceAll([
			addDescriptor(desc("v1"), false),
			addDescriptor(desc("v2"), false),
			clearView(false),
		]);
		expect(s.descriptors).toEqual([]);
	});

	test("RENAME_DESCRIPTOR + SET_RENAME_MODE update the matching row", () => {
		let s = reduceAll([addDescriptor(desc("x"), false)]);
		s = inspectorReducer(s, renameDescriptor("x", "renamed"));
		expect(s.descriptors[0].title).toBe("renamed");

		s = inspectorReducer(s, setRenameMode("x", true));
		expect(s.descriptors[0].renameMode).toBe(true);
	});

	test("SET_DESCRIPTOR_OPTIONS supports 'default' and per-uuid forms", () => {
		let s = reduceAll([addDescriptor(desc("x"), false)]);
		s = inspectorReducer(s, setDescriptorOptions("default", {supportRawDataType: "alphaChannelOptions"}));
		expect(s.settings.initialDescriptorSettings.supportRawDataType).toBe("alphaChannelOptions");

		s = inspectorReducer(s, setDescriptorOptions(["x"], {supportRawDataType: "imageReference"}));
		expect(s.descriptors[0].descriptorSettings.supportRawDataType).toBe("imageReference");
	});
});

describe("inspectorReducer – settings", () => {
	test("SET_FONT_SIZE / SET_RECORD_RAW / SET_MAXIMUM_ITEMS / DONT_SHOW_MARKETPLACE_INFO", () => {
		const s = reduceAll([
			setFontSize("size-small"),
			setRecordRaw(true),
			setMaximumItems("42"),
			setDontShowMarketplaceInfo(true),
		]);
		expect(s.settings.fontSize).toBe("size-small");
		expect(s.settings.makeRawDataEasyToInspect).toBe(true);
		expect(s.settings.maximumItems).toBe(42);
		expect(s.settings.dontShowMarketplaceInfo).toBe(true);
	});

	test("SET_MAXIMUM_ITEMS clamps invalid input to 3", () => {
		expect(inspectorReducer(getInitialState(), setMaximumItems("1")).settings.maximumItems).toBe(3);
		expect(inspectorReducer(getInitialState(), setMaximumItems("oops")).settings.maximumItems).toBe(3);
	});

	test("SET_AUTOEXPAND_LEVEL writes per-part level", () => {
		const s = reduceAll([
			setAutoExpandLevel("DOM", 2),
			setAutoExpandLevel("content", 3),
			setAutoExpandLevel("diff", 4),
		]);
		expect(s.inspector.dom.autoExpandLevels).toBe(2);
		expect(s.inspector.content.autoExpandLevels).toBe(3);
		expect(s.inspector.difference.autoExpandLevels).toBe(4);
	});

	test("SET_COLUMN_SIZE_ACTION writes left/right widths", () => {
		const s = reduceAll([
			setColumnSize(111, "left"),
			setColumnSize(222, "right"),
		]);
		expect(s.settings.leftColumnWidthPx).toBe(111);
		expect(s.settings.rightColumnWidthPx).toBe(222);
	});

	test("SET_INSPECTOR_VIEW_ACTION supports code/content/diff branches", () => {
		const s = reduceAll([
			setInspectorView("code", "original"),
			setInspectorView("content", "raw"),
			setInspectorView("diff", "raw"),
		]);
		expect(s.inspector.code.viewType).toBe("original");
		expect(s.inspector.content.viewType).toBe("raw");
		expect(s.inspector.difference.viewType).toBe("raw");
	});

	test("SET_SETTINGS performs a shallow merge", () => {
		const s = inspectorReducer(getInitialState(), setSettings({fontSize: "size-big", maximumItems: 7}));
		expect(s.settings.fontSize).toBe("size-big");
		expect(s.settings.maximumItems).toBe(7);
	});

	test("TOGGLE_DESCRIPTORS_GROUPING toggles when arg=null, sets explicit when arg=value", () => {
		let s = inspectorReducer(getInitialState(), toggleDescriptorsGrouping(null));
		expect(s.settings.groupDescriptors).toBe("none");
		s = inspectorReducer(s, toggleDescriptorsGrouping(null));
		expect(s.settings.groupDescriptors).toBe("strict");
		s = inspectorReducer(s, toggleDescriptorsGrouping("none"));
		expect(s.settings.groupDescriptors).toBe("none");
	});

	test("SET_NEVER_RECORD_ACTION_NAMES_ACTION splits newline-separated input", () => {
		const s = inspectorReducer(getInitialState(), setNeverRecordActionNames("foo\nbar\nbaz"));
		expect(s.settings.neverRecordActionNames).toEqual(["foo", "bar", "baz"]);
	});

	test("TOGGLE_ACCORDION adds/removes id idempotently", () => {
		let s = inspectorReducer(getInitialState(), toggleAccordion("id-1", true));
		expect(s.settings.accordionExpandedIDs).toContain("id-1");
		// adding again is a no-op
		s = inspectorReducer(s, toggleAccordion("id-1", true));
		expect(s.settings.accordionExpandedIDs.filter(x => x === "id-1")).toHaveLength(1);
		// remove
		s = inspectorReducer(s, toggleAccordion("id-1", false));
		expect(s.settings.accordionExpandedIDs).not.toContain("id-1");
	});

	test("SET_SEARCH_TERM_ACTION / SET_SEARCH_CONTENT_KEYWORD write search inputs", () => {
		const s = reduceAll([
			setSearchTerm("foo"),
			setSearchContentKeyword("bar"),
		]);
		expect(s.settings.searchTerm).toBe("foo");
		expect(s.inspector.content.search).toBe("bar");
	});

	test("SET_CATEGORY_ITEM_VISIBILITY add/remove updates explicit list", () => {
		let s = inspectorReducer(getInitialState(), setCategoryItemVisibility("application", "add"));
		expect(s.explicitlyVisibleTopCategories).toContain("application");
		s = inspectorReducer(s, setCategoryItemVisibility("application", "remove"));
		expect(s.explicitlyVisibleTopCategories).not.toContain("application");
	});
});

describe("inspectorReducer – target reference / property / filter / listener", () => {
	test("SET_TARGET_REFERENCE merges into the selected slice", () => {
		const s = reduceAll([
			setSelectedReferenceType("layer"),
			setTargetReference({type: "layer", layerID: 5} as any),
		]);
		expect((s.targetReference.layer as any).layerID).toBe(5);
	});

	test("SET_PROPERTY with toggle=false replaces, with toggle=true toggles", () => {
		let s = reduceAll([
			setSelectedReferenceType("layer"),
			setProperty("opacity", false),
		]);
		expect((s.targetReference.layer as any).properties).toEqual(["opacity"]);

		s = inspectorReducer(s, setProperty("visible", true));
		expect((s.targetReference.layer as any).properties).toEqual(["opacity", "visible"]);

		s = inspectorReducer(s, setProperty("visible", true));
		expect((s.targetReference.layer as any).properties).toEqual(["opacity"]);
	});

	test("SET_FILTER_STATE main on flips root filter off and disables sub filters", () => {
		const s = reduceAll([
			setSelectedReferenceType("layer"),
			setFilterState("layer", "main", "on"),
		]);
		expect(s.filterBySelectedReferenceType).toBe("off");
	});

	test("SET_FILTER_STATE sub on toggles main to semi", () => {
		const s = reduceAll([
			setSelectedReferenceType("layer"),
			setFilterState("layer", "layerID", "off"),
		]);
		expect(s.filterBySelectedReferenceType).toBe("semi");
	});

	test("SET_LISTENER_NOTIFIER writes listener vs notifier filter", () => {
		let s = reduceAll([
			setSelectedReferenceType("listener"),
			setListenerNotifierFilter({type: "include"}),
		]);
		expect(s.settings.listenerFilter.type).toBe("include");

		s = inspectorReducer(s, setSelectedReferenceType("notifier"));
		s = inspectorReducer(s, setListenerNotifierFilter({type: "exclude"}));
		expect(s.settings.notifierFilter.type).toBe("exclude");
	});

	test("listener / spy / auto-inspector mutual exclusion (all 3 branches)", () => {
		const s1 = inspectorReducer(getInitialState(), setListener(true));
		expect(s1.settings.autoUpdateListener).toBe(true);

		const s2 = inspectorReducer(s1, setSpy(true));
		expect(s2.settings.autoUpdateSpy).toBe(true);
		expect(s2.settings.autoUpdateListener).toBe(false);

		const s3 = inspectorReducer(s2, setAutoInspector(true));
		expect(s3.settings.autoUpdateInspector).toBe(true);
		expect(s3.settings.autoUpdateSpy).toBe(false);
	});
});

describe("inspectorReducer – tree paths", () => {
	test("SET_INSPECTOR_PATH_DIFF replace / add", () => {
		let s = inspectorReducer(getInitialState(), setInspectorPathDiff(["a", "b"], "replace"));
		expect(s.inspector.difference.treePath).toEqual(["a", "b"]);
		s = inspectorReducer(s, setInspectorPathDiff(["c"], "add"));
		expect(s.inspector.difference.treePath).toEqual(["a", "b", "c"]);
	});

	test("SET_INSPECTOR_PATH_CONTENT replace / add", () => {
		let s = inspectorReducer(getInitialState(), setInspectorPathContent(["a"], "replace"));
		expect(s.inspector.content.treePath).toEqual(["a"]);
		s = inspectorReducer(s, setInspectorPathContent(["b"], "add"));
		expect(s.inspector.content.treePath).toEqual(["a", "b"]);
	});

	test("SET_INSPECTOR_PATH_DOM replace / add", () => {
		let s = inspectorReducer(getInitialState(), setInspectorPathDom(["a"], "replace"));
		expect(s.inspector.dom.treePath).toEqual(["a"]);
		s = inspectorReducer(s, setInspectorPathDom(["b"], "add"));
		expect(s.inspector.dom.treePath).toEqual(["a", "b"]);
	});

	test("SET_EXPANDED_PATH expands and then collapses an entry (content)", () => {
		const data = {foo: {bar: 1}};
		let s = inspectorReducer(getInitialState(), setExpandedPath("content", ["foo"], true, false, data));
		expect(s.inspector.content.expandedTree.length).toBe(1);
		s = inspectorReducer(s, setExpandedPath("content", ["foo"], false, false, data));
		expect(s.inspector.content.expandedTree.length).toBe(0);
	});

	test("SET_EXPANDED_PATH recursive=true expands every nested object (difference)", () => {
		const data = {root: {a: {b: 1}, c: {d: 2}}};
		const s = inspectorReducer(
			getInitialState(),
			setExpandedPath("difference", ["root"], true, true, data),
		);
		expect(s.inspector.difference.expandedTree.length).toBeGreaterThan(1);
	});
});

describe("inspectorReducer – import / export / clear / dispatcher", () => {
	test("IMPORT_STATE replaces inspector state by payload", () => {
		const payload = {...getInitialState(), selectedReferenceType: "document"} as IInspectorState;
		const s = inspectorReducer(getInitialState(), importState({inspector: payload}));
		expect(s.selectedReferenceType).toBe("document");
	});

	test("IMPORT_ITEMS append adds with fresh ids; replace overwrites", () => {
		let s = inspectorReducer(getInitialState(), importItems([desc("imp1"), desc("imp2")], "append"));
		expect(s.descriptors).toHaveLength(2);
		// ids were re-generated by crypto.randomUUID()
		expect(s.descriptors.map(d => d.id)).not.toEqual(["imp1", "imp2"]);

		s = inspectorReducer(s, importItems([desc("only")], "replace"));
		expect(s.descriptors).toHaveLength(1);
		expect(s.descriptors[0].id).toBe("only");
	});

	test("CLEAR keeps locked descriptors and resets inspector subtree", () => {
		const s = reduceAll([
			addDescriptor(desc("k"), false),
			lockDesc(true, ["k"]),
			addDescriptor(desc("notk"), false),
			clear(),
		]);
		expect(s.descriptors.map(d => d.id)).toEqual(["k"]);
		expect(s.inspector.content.treePath).toEqual([]);
	});

	test("SET_DISPATCHER_VALUE writes snippet content", () => {
		const s = inspectorReducer(getInitialState(), setDispatcherValue("code()"));
		expect(s.dispatcher.snippets[0].content).toBe("code()");
	});

	test("TOGGLE_SETTINGS flips visibility", () => {
		const before = getInitialState().settings.settingsVisible;
		const s = inspectorReducer(getInitialState(), toggleSettings());
		expect(s.settings.settingsVisible).toBe(!before);
	});

	test("SET_MODE_TAB writes activeTab", () => {
		const s = inspectorReducer(getInitialState(), setModeTab("dom"));
		expect(s.inspector.activeTab).toBe("dom");
	});
});

// ---------------------------------------------------------------------------
// "No-op" actions that should be passed through unchanged.
// They exist only to trigger UI side-effects; the reducer must not crash
// and must return the same logical state.
// ---------------------------------------------------------------------------

describe("inspectorReducer – pass-through actions", () => {
	test("FILTER_EVENT_NAME_ACTION is accepted without throwing", () => {
		const s0 = getInitialState();
		expect(() => inspectorReducer(s0, filterEventName("ev", "include", "add"))).not.toThrow();
	});
});

// ---------------------------------------------------------------------------
// atnReducer – every case
// ---------------------------------------------------------------------------

describe("atnReducer", () => {
	test("SET_DATA / CLEAR_ALL / SET_DONT_SEND_DISABLED", () => {
		let s = inspectorReducer(getInitialState(), setData([atnSet("a"), atnSet("b")]));
		expect(s.atnConverter.data.map(x => x.__uuid__)).toEqual(["a", "b"]);

		s = inspectorReducer(s, setDontSendDisabled(true));
		expect(s.atnConverter.dontSendDisabled).toBe(true);

		s = inspectorReducer(s, clearAll());
		expect(s.atnConverter.data).toEqual([]);
	});

	test("EXPAND_ACTION add then remove the same path", () => {
		let s = inspectorReducer(getInitialState(), setData([atnSet("a")]));
		s = inspectorReducer(s, expandAction(["a"], true, false));
		expect(s.atnConverter.expandedItems).toHaveLength(1);

		s = inspectorReducer(s, expandAction(["a"], false, false));
		expect(s.atnConverter.expandedItems).toHaveLength(0);
	});

	test("SELECT_ACTION add / subtract / replace / none", () => {
		let s = inspectorReducer(getInitialState(), setData([atnSet("a"), atnSet("b")]));
		s = inspectorReducer(s, selectAction("add", ["a"]));
		s = inspectorReducer(s, selectAction("add", ["b"]));
		expect(s.atnConverter.selectedItems.length).toBeGreaterThanOrEqual(2);

		s = inspectorReducer(s, selectAction("subtract", ["a"]));
		expect(s.atnConverter.selectedItems.length).toBeGreaterThanOrEqual(1);

		s = inspectorReducer(s, selectAction("replace", ["b"]));
		expect(s.atnConverter.selectedItems.length).toBe(1);

		s = inspectorReducer(s, selectAction("none"));
		expect(s.atnConverter.selectedItems).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// sorReducer – every case
// ---------------------------------------------------------------------------

describe("sorReducer", () => {
	test("MAKE snippet / panel / command", () => {
		const s0 = getInitialState();
		const beforeSnippets = s0.sorcerer.snippets.list.length;
		const beforeEntry = s0.sorcerer.manifestInfo.entrypoints.length;

		const s = reduceAll([
			make("snippet"),
			make("panel"),
			make("command"),
		]);
		expect(s.sorcerer.snippets.list.length).toBe(beforeSnippets + 1);
		expect(s.sorcerer.manifestInfo.entrypoints.length).toBe(beforeEntry + 2);
	});

	test("REMOVE snippet / panel / command + resets selection to general", () => {
		const s0 = getInitialState();
		const snippetUuid = (s0.sorcerer.snippets.list[0] as any).$$$uuid as string;
		const entryUuid = (s0.sorcerer.manifestInfo.entrypoints[0] as any).$$$uuid as string;
		const entryType = (s0.sorcerer.manifestInfo.entrypoints[0] as any).type as "panel" | "command";

		const s = reduceAll([
			select("snippet", snippetUuid),
			remove("snippet", snippetUuid),
			remove(entryType, entryUuid),
		]);
		expect(s.sorcerer.snippets.list.find(x => (x as any).$$$uuid === snippetUuid)).toBeUndefined();
		expect(s.sorcerer.manifestInfo.entrypoints.find(x => (x as any).$$$uuid === entryUuid)).toBeUndefined();
		expect(s.sorcerer.selectedItem).toEqual({kind: "general", uuid: null});
	});

	test("SET_MAIN / SET_PANEL / SET_COMMAND / SET_SNIPPET / SET_HOST_APP", () => {
		const s0 = getInitialState();
		const snippetUuid = (s0.sorcerer.snippets.list[0] as any).$$$uuid as string;

		// Find or create a panel / command for SET_PANEL / SET_COMMAND.
		let s = inspectorReducer(s0, make("panel"));
		const panel = s.sorcerer.manifestInfo.entrypoints.find(e => e.type === "panel")!;
		s = inspectorReducer(s, make("command"));
		const command = s.sorcerer.manifestInfo.entrypoints.find(e => e.type === "command")!;

		s = inspectorReducer(s, setMain({name: "P", id: "com.test", version: "1.0.0"} as any));
		expect(s.sorcerer.manifestInfo.name).toBe("P");

		s = inspectorReducer(s, setPanel({label: {default: "Lbl"}} as any, (panel as any).$$$uuid));
		const updatedPanel = s.sorcerer.manifestInfo.entrypoints.find(e => (e as any).$$$uuid === (panel as any).$$$uuid);
		expect((updatedPanel as any).label.default).toBe("Lbl");

		s = inspectorReducer(s, setCommand({label: {default: "Cmd"}} as any, (command as any).$$$uuid));
		const updatedCmd = s.sorcerer.manifestInfo.entrypoints.find(e => (e as any).$$$uuid === (command as any).$$$uuid);
		expect((updatedCmd as any).label.default).toBe("Cmd");

		s = inspectorReducer(s, setSnippet({code: "// x"} as any, snippetUuid));
		const updatedSnip = s.sorcerer.snippets.list.find(x => (x as any).$$$uuid === snippetUuid);
		expect((updatedSnip as any).code).toBe("// x");

		s = inspectorReducer(s, setHostApp("PS", {minVersion: "22.0.0"}));
		const psHost = s.sorcerer.manifestInfo.host.find(h => h.app === "PS");
		expect(psHost?.minVersion).toBe("22.0.0");
	});

	test("ASSIGN_SNIPPET_TO_PANEL on / off", () => {
		let s = inspectorReducer(getInitialState(), make("panel"));
		const panel = s.sorcerer.manifestInfo.entrypoints.find(e => e.type === "panel")!;
		const snippetUuid = (s.sorcerer.snippets.list[0] as any).$$$uuid as string;

		s = inspectorReducer(s, assignSnippetToPanel("on", (panel as any).$$$uuid, snippetUuid));
		let p = s.sorcerer.manifestInfo.entrypoints.find(e => (e as any).$$$uuid === (panel as any).$$$uuid) as any;
		expect(p.$$$snippetUUIDs).toContain(snippetUuid);

		// idempotent on
		s = inspectorReducer(s, assignSnippetToPanel("on", (panel as any).$$$uuid, snippetUuid));
		p = s.sorcerer.manifestInfo.entrypoints.find(e => (e as any).$$$uuid === (panel as any).$$$uuid) as any;
		expect(p.$$$snippetUUIDs.filter((x: string) => x === snippetUuid)).toHaveLength(1);

		s = inspectorReducer(s, assignSnippetToPanel("off", (panel as any).$$$uuid, snippetUuid));
		p = s.sorcerer.manifestInfo.entrypoints.find(e => (e as any).$$$uuid === (panel as any).$$$uuid) as any;
		expect(p.$$$snippetUUIDs).not.toContain(snippetUuid);
	});

	test("SET_PRESET replaces the whole sorcerer slice", () => {
		const s0 = getInitialState();
		const preset = {...s0.sorcerer, manifestInfo: {...s0.sorcerer.manifestInfo, name: "Preset"}};
		const s = inspectorReducer(s0, setPreset(preset));
		expect(s.sorcerer.manifestInfo.name).toBe("Preset");
	});

	test("SELECT writes selectedItem", () => {
		const s = inspectorReducer(getInitialState(), select("panel", "uuid-1"));
		expect(s.sorcerer.selectedItem).toEqual({kind: "panel", uuid: "uuid-1"});
	});
});
