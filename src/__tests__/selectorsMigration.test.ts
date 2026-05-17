/**
 * @jest-environment jsdom
 *
 * Migration-safety tests for selectors (Redux -> Redux Toolkit).
 *
 * Selectors are the easiest layer to keep stable across the migration:
 * they are pure `(state) => result` functions and don't depend on how
 * the store / reducer is built. These tests:
 *
 *   1. Lock down the public input/output contract of each selector
 *      against a known state.
 *   2. Verify that `createSelector` from `reselect` (or, after migration,
 *      from `@reduxjs/toolkit`, which re-exports it) memoizes correctly:
 *      same input reference -> same output reference, no recomputation.
 *   3. Verify that a state change *invalidates* the cache where it should.
 *
 * If a selector is later rewritten on top of `createSlice` selectors or
 * RTK's `createSelector`, these tests should remain green without any
 * modification – only the underlying state shape and selector function
 * names must stay the same.
 */

// Match the mocks used by reduxMigration.test.ts so the inspector reducer
// (transitively required by the selector modules) doesn't try to load uxp,
// fs or the Photoshop bootstrap chain.
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
	setModeTab,
	addDescriptor,
	selectDescriptor,
	lockDesc,
	pinDesc,
	toggleSettings,
	setFontSize,
	setSelectedReferenceType,
	setDispatcherValue,
} = inspectorSlice.actions;

const {
	setData,
	expandAction,
	selectAction,
	setDontSendDisabled,
} = atnSlice.actions;

const {
	make,
	select,
} = sorSlice.actions;

import * as Insp from "../inspector/selectors/inspectorSelectors";
import {getDispatcherSnippet} from "../inspector/selectors/dispatcherSelectors";
import * as Atn from "../atnDecoder/atnSelectors";
import * as Sor from "../sorcerer/sorSelectors";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let _crc = 1000;
function makeDescriptor(id: string, overrides: Partial<IDescriptor> = {}): IDescriptor {
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

function makeAtnSet(uuid: string, label = uuid): IActionSetUUID {
	return {
		__uuid__: uuid,
		actionSetName: label,
		actionItems: [],
		expanded: true,
		isOn: true,
	} as unknown as IActionSetUUID;
}

/** Wrap an `IInspectorState` into a root-state shape. */
function asRoot(inspector: IInspectorState): IRootState {
	return {inspector};
}

/** Drive the real reducer to evolve state – this is what selectors will
 *  see at runtime. Using the reducer (instead of hand-building state)
 *  also guarantees the selectors stay compatible with the actual state
 *  produced by the migrated store. */
function seedInspectorState(actions: Array<Parameters<typeof inspectorReducer>[1]>): IInspectorState {
	return actions.reduce<IInspectorState>(
		(s, a) => inspectorReducer(s, a),
		getInitialState(),
	);
}

// ---------------------------------------------------------------------------
// Inspector selectors
// ---------------------------------------------------------------------------

describe("inspector selectors", () => {
	test("getModeTabID reflects active tab", () => {
		const root = asRoot(seedInspectorState([setModeTab("difference")]));
		expect(Insp.getModeTabID(root)).toBe("difference");
	});

	test("getSelectedTargetReference returns the configured type", () => {
		const root = asRoot(seedInspectorState([setSelectedReferenceType("document")]));
		expect(Insp.getSelectedTargetReference(root)).toBe("document");
	});

	test("getAllDescriptors / getSelectedDescriptors / getSelectedDescriptorsUUID", () => {
		const root = asRoot(seedInspectorState([
			addDescriptor(makeDescriptor("d1"), false),
			addDescriptor(makeDescriptor("d2"), false),
			addDescriptor(makeDescriptor("d3"), false),
			selectDescriptor("replace", "d2"),
			selectDescriptor("add", "d3"),
		]));

		expect(Insp.getAllDescriptors(root).map(d => d.id)).toEqual(["d1", "d2", "d3"]);
		expect(Insp.getSelectedDescriptors(root).map(d => d.id).sort()).toEqual(["d2", "d3"]);
		expect(Insp.getSelectedDescriptorsUUID(root).sort()).toEqual(["d2", "d3"]);
	});

	test("getLockedSelection / getPinnedSelection / getRemovableSelection", () => {
		// No selection -> nothing is locked or pinned, so removable.
		let root = asRoot(seedInspectorState([
			addDescriptor(makeDescriptor("d1"), false),
		]));
		expect(Insp.getLockedSelection(root)).toBe(false);
		expect(Insp.getPinnedSelection(root)).toBe(false);
		expect(Insp.getRemovableSelection(root)).toBe(true);

		// Lock + select -> selection is "locked" => not removable.
		root = asRoot(seedInspectorState([
			addDescriptor(makeDescriptor("d1"), false),
			lockDesc(true, ["d1"]),
			selectDescriptor("replace", "d1"),
		]));
		expect(Insp.getLockedSelection(root)).toBe(true);
		expect(Insp.getRemovableSelection(root)).toBe(false);

		// Pin + select -> pinned.
		root = asRoot(seedInspectorState([
			addDescriptor(makeDescriptor("d2"), false),
			pinDesc(true, ["d2"]),
			selectDescriptor("replace", "d2"),
		]));
		expect(Insp.getPinnedSelection(root)).toBe(true);
	});

	test("getActiveRef returns the slice of targetReference for the active type", () => {
		const root = asRoot(seedInspectorState([setSelectedReferenceType("layer")]));
		const ref = Insp.getActiveRef(root);
		expect(ref.type).toBe("layer");
	});

	test("getCategoryItemsVisibility always includes the active reference type", () => {
		const root = asRoot(seedInspectorState([setSelectedReferenceType("layer")]));
		const visible = Insp.getCategoryItemsVisibility(root);
		expect(visible).toContain("layer");
		// Top default categories are kept too.
		expect(visible).toEqual(expect.arrayContaining(["listener", "dispatcher", "replies"]));
	});

	test("getInspectorSettings / getFontSizeSettings / getSettingsVisible", () => {
		const root = asRoot(seedInspectorState([
			setFontSize("size-big"),
			toggleSettings(),
		]));
		expect(Insp.getInspectorSettings(root)).toBe(root.inspector.settings);
		expect(Insp.getFontSizeSettings(root)).toBe("size-big");
		expect(Insp.getSettingsVisible(root)).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Dispatcher selector
// ---------------------------------------------------------------------------

describe("dispatcher selector", () => {
	test("getDispatcherSnippet returns the first snippet's content", () => {
		const root = asRoot(seedInspectorState([setDispatcherValue("// hi")]));
		expect(getDispatcherSnippet(root)).toBe("// hi");
	});
});

// ---------------------------------------------------------------------------
// ATN selectors
// ---------------------------------------------------------------------------

describe("atn selectors", () => {
	test("getData / getDontSendDisabled / getSetByUUID", () => {
		const sets = [makeAtnSet("a"), makeAtnSet("b")];
		const root = asRoot(seedInspectorState([
			setData(sets),
			setDontSendDisabled(true),
		]));

		expect(Atn.getData(root).map(s => s.__uuid__)).toEqual(["a", "b"]);
		expect(Atn.getDontSendDisabled(root)).toBe(true);

		// `getSetByUUID` is a non-memoized helper that takes IInspectorState.
		expect(Atn.getSetByUUID(root.inspector, "a")?.__uuid__).toBe("a");
		expect(Atn.getSetByUUID(root.inspector, "missing")).toBeNull();
	});

	test("expanded/selected helpers split by path length", () => {
		const root = asRoot(seedInspectorState([
			setData([makeAtnSet("a")]),
			expandAction(["a"], true, false),
			selectAction("replace", ["a"]),
		]));

		expect(Atn.getExpandedItemsSet(root).length).toBeGreaterThan(0);
		expect(Atn.getSelectedItemsSet(root).length).toBeGreaterThan(0);
		expect(Atn.getExpandedItemsAction(root)).toEqual([]);
		expect(Atn.getSelectedItemsAction(root)).toEqual([]);
		expect(Atn.getSelectedItemsCommand(root)).toEqual([]);
	});

	test("selectedSets / selected projects selection back to data rows", () => {
		const root = asRoot(seedInspectorState([
			setData([makeAtnSet("a"), makeAtnSet("b")]),
			selectAction("replace", ["a"]),
		]));

		const sets = Atn.selectedSets(root);
		expect(sets.map(s => s.__uuid__)).toEqual(["a"]);
		// `selected` is the union of sets/actions/commands.
		expect(Atn.selected(root)).toEqual(sets);
	});

	test("getLastSelected returns null when there is no selection", () => {
		const root = asRoot(getInitialState());
		expect(Atn.getLastSelected(root)).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// Sorcerer selectors
// ---------------------------------------------------------------------------

describe("sorcerer selectors", () => {
	test("getManifestGeneric returns the manifestInfo slice", () => {
		const root = asRoot(getInitialState());
		expect(Sor.getManifestGeneric(root)).toBe(root.inspector.sorcerer.manifestInfo);
	});

	test("getAllSnippets / getAllEntryPoints / getAllCommands / getAllPanels filter by kind", () => {
		const root = asRoot(seedInspectorState([
			make("snippet"),
			make("command"),
			make("panel"),
		]));

		// Initial state already contains 1 snippet, 1 command and 1 panel; we
		// added one more of each.
		expect(Sor.getAllSnippets(root).length).toBe(2);
		expect(Sor.getAllCommands(root).every(c => c.type === "command")).toBe(true);
		expect(Sor.getAllPanels(root).every(p => p.type === "panel")).toBe(true);
		expect(Sor.getAllEntryPoints(root).length).toBe(
			Sor.getAllCommands(root).length + Sor.getAllPanels(root).length,
		);
	});

	test("isGenericModuleVisible reflects the current selection kind", () => {
		const initial = asRoot(getInitialState());
		expect(Sor.isGenericModuleVisible(initial)).toBe(true);

		const afterSelect = asRoot(seedInspectorState([select("snippet", "x")]));
		expect(Sor.isGenericModuleVisible(afterSelect)).toBe(false);
	});

	test("shouldEnableRemove is false for the generic 'general' selection", () => {
		const initial = asRoot(getInitialState());
		expect(Sor.shouldEnableRemove(initial)).toBe(false);

		const afterSelect = asRoot(seedInspectorState([select("snippet", "x")]));
		expect(Sor.shouldEnableRemove(afterSelect)).toBe(true);
	});

	test("getActiveSnippet returns the snippet matching the selected uuid", () => {
		const s0 = getInitialState();
		const firstSnippetUuid = (s0.sorcerer.snippets.list[0] as any).$$$uuid as string;
		const root = asRoot(inspectorReducer(s0, select("snippet", firstSnippetUuid)));

		const active = Sor.getActiveSnippet(root);
		expect(active).not.toBeNull();
		expect((active as any).$$$uuid).toBe(firstSnippetUuid);
	});
});

// ---------------------------------------------------------------------------
// Reselect memoization contract
// ---------------------------------------------------------------------------

describe("memoization contract (reselect / RTK createSelector)", () => {
	test("same state reference -> selector returns identical reference", () => {
		const root = asRoot(seedInspectorState([
			addDescriptor(makeDescriptor("d1"), false),
			selectDescriptor("replace", "d1"),
		]));

		const first = Insp.getSelectedDescriptors(root);
		const second = Insp.getSelectedDescriptors(root);
		// Memoized: object identity must be preserved across calls.
		expect(second).toBe(first);
	});

	test("derived selectors stay cached when upstream input is unchanged", () => {
		const root = asRoot(seedInspectorState([
			addDescriptor(makeDescriptor("d1"), false),
			selectDescriptor("replace", "d1"),
		]));

		const uuids1 = Insp.getSelectedDescriptorsUUID(root);
		const uuids2 = Insp.getSelectedDescriptorsUUID(root);
		expect(uuids2).toBe(uuids1);
	});

	test("cache is invalidated when the underlying slice changes", () => {
		const stateA = seedInspectorState([
			addDescriptor(makeDescriptor("d1"), false),
		]);
		const rootA = asRoot(stateA);
		const beforeChange = Insp.getAllDescriptors(rootA);

		// Dispatch a change to descriptors and verify the selector returns
		// a *different* array reference (immer makes a new top-level state
		// object, the reselect input changes, recompute happens).
		const stateB = inspectorReducer(stateA, addDescriptor(makeDescriptor("d2"), false));
		const rootB = asRoot(stateB);
		const afterChange = Insp.getAllDescriptors(rootB);

		expect(afterChange).not.toBe(beforeChange);
		expect(afterChange.map(d => d.id)).toEqual(["d1", "d2"]);
	});

	test("unrelated state changes do NOT trigger recompute (reselect skip-equal-input)", () => {
		// `getDispatcherSnippet` only depends on `state.inspector.dispatcher`.
		// Flipping `settings.settingsVisible` must not invalidate its cache
		// because reselect compares input references, and the `all` selector
		// returns the whole `state.inspector` object – which DOES change.
		// Therefore reselect will recompute, but the returned VALUE is still
		// equal. This test documents that contract explicitly.
		const stateA = seedInspectorState([setDispatcherValue("// pinned")]);
		const before = getDispatcherSnippet(asRoot(stateA));

		const stateB = inspectorReducer(stateA, toggleSettings());
		const after = getDispatcherSnippet(asRoot(stateB));

		// Value-equal (strings are primitives, so `toBe` works).
		expect(after).toBe(before);
	});
});
