/**
 * @jest-environment jsdom
 *
 * Migration-safety tests for Redux -> Redux Toolkit.
 *
 * Goal: these tests must pass both BEFORE and AFTER the migration
 * to `@reduxjs/toolkit`. They intentionally avoid asserting on
 * internal implementation details (action `type` strings, exact
 * reducer source) and instead verify *behavior*:
 *
 *   1. Action creators return objects of the expected shape.
 *   2. Reducers produce the expected state for a given input.
 *   3. The full store, wired together, behaves the same way for
 *      a representative sequence of dispatches.
 *
 * When you migrate a slice to `createSlice`, keep:
 *   - the action creator FUNCTION NAMES identical, and
 *   - the action creator INPUT/OUTPUT PAYLOADS identical.
 * Then these tests stay green and prove the migration is behavior-
 * preserving.
 */

// Avoid touching uxp/fs side effects from Settings during import & dispatch.
jest.mock("../inspector/classes/Settings", () => ({
	Settings: {
		importState: (): null => null,
		saveSettings: jest.fn().mockResolvedValue(undefined),
		setSpectrumComponentSize: jest.fn(),
	},
}));

// The inspector reducer transitively imports `ListenerClass`, which pulls in
// the whole Photoshop bootstrap chain. We only need its static stop* methods
// when SET_LISTENER / SET_SPY / SET_AUTO_INSPECTOR are dispatched, so stub it.
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

import {legacy_createStore as createStore, combineReducers, applyMiddleware, Middleware} from "@reduxjs/toolkit";

import {inspectorReducer} from "../inspector/reducers/reducer";
import {getInitialState} from "../inspector/inspInitialState";
import {IInspectorState} from "../inspector/model/types";

import {
	setModeTabAction,
	toggleSettingsAction,
	setFontSizeAction,
	setDispatcherValueAction,
	setListenerAction,
	setSpyAction,
	setAutoInspectorAction,
	addDescriptorAction,
	selectDescriptorAction,
	lockDescAction,
	removeDescAction,
	clearAction,
	setSelectedReferenceTypeAction,
} from "../inspector/actions/inspectorActions";

import {
	setDataAction,
	setSelectActionAction,
	setExpandActionAction,
	clearAllAction,
	setDontSendDisabledAction,
} from "../atnDecoder/atnActions";

import {
	setSelectAction as setSorSelectAction,
	makeAction as makeSorAction,
	setMainAction,
	setSnippetAction,
} from "../sorcerer/sorActions";

import {IActionSetUUID} from "../atnDecoder/atnModel";
import {IDescriptor} from "../inspector/model/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a root store identical in shape to `shared/store.ts`. */
function makeStore() {
	const rootReducer = combineReducers<{inspector: IInspectorState}>({
		inspector: inspectorReducer,
	});
	const dispatched: any[] = [];
	const recorder: Middleware = () => next => action => {
		dispatched.push(action);
		return next(action);
	};
	const store = createStore(rootReducer, applyMiddleware(recorder));
	return {store, dispatched};
}

function makeDescriptor(id: string, title = id): IDescriptor {
	// Minimal viable descriptor; cast to IDescriptor so we don't have to
	// reproduce its entire shape – the reducer only touches a few fields.
	// Each descriptor gets a UNIQUE crc so reducer cases that group by crc
	// (LOCK_DESC, REMOVE_DESC, … in the default "strict" mode) treat them
	// as independent rows.
	let crcCounter = (makeDescriptor as any)._crc ?? 1000;
	crcCounter += 1;
	(makeDescriptor as any)._crc = crcCounter;
	return {
		id,
		crc: crcCounter,
		originalReference: {} as any,
		startTime: 0,
		endTime: 0,
		selected: false,
		locked: false,
		pinned: false,
		groupCalculatedReference: null,
		originalData: {} as any,
		calculatedReference: null,
		title,
		renameMode: false,
		descriptorSettings: {
			supportRawDataType: "auto",
		} as any,
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

// ---------------------------------------------------------------------------
// 1) Action creators – shape only
// ---------------------------------------------------------------------------

describe("action creators – shape", () => {
	test("setModeTabAction returns a plain action with payload", () => {
		const a = setModeTabAction("content");
		expect(a).toEqual(expect.objectContaining({payload: "content"}));
		expect(typeof a.type).toBe("string");
	});

	test("setFontSizeAction wraps payload", () => {
		const a = setFontSizeAction("size-big");
		expect(a.payload).toBe("size-big");
		expect(typeof a.type).toBe("string");
	});

	test("addDescriptorAction nests {arg, replace}", () => {
		const desc = makeDescriptor("x");
		const a = addDescriptorAction(desc, true);
		expect(a.payload).toEqual({arg: desc, replace: true});
	});

	test("setDataAction (atn) wraps array payload", () => {
		const sets = [makeAtnSet("a"), makeAtnSet("b")];
		const a = setDataAction(sets);
		expect(a.payload).toEqual(sets);
	});

	test("makeSorAction carries {type}", () => {
		const a = makeSorAction("snippet");
		expect(a.payload).toEqual({type: "snippet"});
	});
});

// ---------------------------------------------------------------------------
// 2) Reducer behavior – per slice
// ---------------------------------------------------------------------------

describe("inspector reducer – behavior", () => {
	test("unknown action returns a state object equal in shape to the initial state", () => {
		// We can't compare with `getInitialState()` directly because
		// the sorcerer slice contains freshly generated UUIDs each call.
		// Instead, verify a representative selection of stable fields.
		const next = inspectorReducer(undefined as any, {type: "@@INIT/UNKNOWN"} as any);
		expect(next.selectedReferenceType).toBe("layer");
		expect(next.descriptors).toEqual([]);
		expect(next.inspector.activeTab).toBe("content");
		expect(next.atnConverter.data).toEqual([]);
		expect(next.sorcerer.manifestInfo.name).toBe("Plugin name");
	});

	test("SET_MODE_TAB updates inspector.activeTab", () => {
		const s0 = getInitialState();
		const s1 = inspectorReducer(s0, setModeTabAction("difference"));
		expect(s1.inspector.activeTab).toBe("difference");
		// purity: previous state untouched
		expect(s0.inspector.activeTab).toBe("content");
	});

	test("TOGGLE_SETTINGS flips settings.settingsVisible", () => {
		const s0 = getInitialState();
		const before = s0.settings.settingsVisible;
		const s1 = inspectorReducer(s0, toggleSettingsAction());
		const s2 = inspectorReducer(s1, toggleSettingsAction());
		expect(s1.settings.settingsVisible).toBe(!before);
		expect(s2.settings.settingsVisible).toBe(before);
	});

	test("SET_FONT_SIZE writes settings.fontSize", () => {
		const s = inspectorReducer(getInitialState(), setFontSizeAction("size-big"));
		expect(s.settings.fontSize).toBe("size-big");
	});

	test("SET_SELECTED_REFERENCE_TYPE_ACTION updates top-level field", () => {
		const s = inspectorReducer(getInitialState(), setSelectedReferenceTypeAction("document"));
		expect(s.selectedReferenceType).toBe("document");
	});

	test("ADD_DESCRIPTOR appends, SELECT_DESCRIPTOR marks selected, REMOVE_DESC removes", () => {
		let s: IInspectorState = getInitialState();
		s = inspectorReducer(s, addDescriptorAction(makeDescriptor("d1"), false));
		s = inspectorReducer(s, addDescriptorAction(makeDescriptor("d2"), false));
		expect(s.descriptors.map(d => d.id)).toEqual(["d1", "d2"]);

		s = inspectorReducer(s, selectDescriptorAction("replace", "d2"));
		expect(s.descriptors.find(d => d.id === "d2")?.selected).toBe(true);
		expect(s.descriptors.find(d => d.id === "d1")?.selected).toBe(false);

		s = inspectorReducer(s, lockDescAction(true, ["d1"]));
		expect(s.descriptors.find(d => d.id === "d1")?.locked).toBe(true);

		// REMOVE_DESC respects the lock flag: locked items survive removal.
		s = inspectorReducer(s, removeDescAction(["d1", "d2"]));
		expect(s.descriptors.map(d => d.id)).toEqual(["d1"]);
	});

	test("CLEAR removes all unlocked descriptors", () => {
		let s: IInspectorState = getInitialState();
		s = inspectorReducer(s, addDescriptorAction(makeDescriptor("d1"), false));
		s = inspectorReducer(s, addDescriptorAction(makeDescriptor("d2"), false));
		s = inspectorReducer(s, lockDescAction(true, ["d1"]));
		s = inspectorReducer(s, clearAction());
		// d1 was locked => kept, d2 removed
		expect(s.descriptors.map(d => d.id)).toEqual(["d1"]);
	});

	test("listener / spy / auto-inspector are mutually exclusive when enabled", () => {
		// Enabling one of these three flags clears the other two — this is
		// a documented behavior the migration must preserve.
		let s = getInitialState();
		s = inspectorReducer(s, setListenerAction(true));
		expect(s.settings.autoUpdateListener).toBe(true);
		expect(s.settings.autoUpdateSpy).toBe(false);
		expect(s.settings.autoUpdateInspector).toBe(false);

		s = inspectorReducer(s, setSpyAction(true));
		expect(s.settings.autoUpdateSpy).toBe(true);
		expect(s.settings.autoUpdateListener).toBe(false);
		expect(s.settings.autoUpdateInspector).toBe(false);

		s = inspectorReducer(s, setAutoInspectorAction(true));
		expect(s.settings.autoUpdateInspector).toBe(true);
		expect(s.settings.autoUpdateListener).toBe(false);
		expect(s.settings.autoUpdateSpy).toBe(false);

		// And turning the last one off leaves everything off.
		s = inspectorReducer(s, setAutoInspectorAction(false));
		expect(s.settings.autoUpdateInspector).toBe(false);
	});

	test("SET_DISPATCHER_VALUE writes dispatcher snippet content", () => {
		const s = inspectorReducer(getInitialState(), setDispatcherValueAction("// hello"));
		expect(s.dispatcher.snippets[0].content).toBe("// hello");
	});
});

describe("atn reducer (via root) – behavior", () => {
	test("SET_DATA appends, CLEAR_ALL empties", () => {
		let s = getInitialState();
		s = inspectorReducer(s, setDataAction([makeAtnSet("a"), makeAtnSet("b")]));
		expect(s.atnConverter.data.map(x => x.__uuid__)).toEqual(["a", "b"]);

		s = inspectorReducer(s, clearAllAction());
		expect(s.atnConverter.data).toEqual([]);
	});

	test("SET_DONT_SEND_DISABLED writes flag", () => {
		const s = inspectorReducer(getInitialState(), setDontSendDisabledAction(true));
		expect(s.atnConverter.dontSendDisabled).toBe(true);
	});

	test("SELECT_ACTION (replace) stores selection", () => {
		let s = getInitialState();
		s = inspectorReducer(s, setDataAction([makeAtnSet("a")]));
		s = inspectorReducer(s, setSelectActionAction("replace", ["a"]));
		// We don't assert exact selection shape (impl detail), only that *something* changed.
		expect(s.atnConverter.selectedItems.length).toBeGreaterThan(0);
	});

	test("EXPAND_ACTION toggles an entry in expandedItems", () => {
		let s = getInitialState();
		s = inspectorReducer(s, setDataAction([makeAtnSet("a")]));
		const before = s.atnConverter.expandedItems.length;

		s = inspectorReducer(s, setExpandActionAction(["a"], true, false));
		expect(s.atnConverter.expandedItems.length).toBe(before + 1);

		s = inspectorReducer(s, setExpandActionAction(["a"], false, false));
		expect(s.atnConverter.expandedItems.length).toBe(before);
	});
});

describe("sorcerer reducer (via root) – behavior", () => {
	test("SELECT records the selected item kind/uuid", () => {
		const s = inspectorReducer(getInitialState(), setSorSelectAction("snippet", "uuid-1"));
		expect(s.sorcerer.selectedItem).toEqual({kind: "snippet", uuid: "uuid-1"});
	});

	test("MAKE snippet appends to snippets.list", () => {
		const s0 = getInitialState();
		const before = s0.sorcerer.snippets.list.length;
		const s1 = inspectorReducer(s0, makeSorAction("snippet"));
		expect(s1.sorcerer.snippets.list.length).toBe(before + 1);
	});

	test("MAKE panel/command appends to manifest entrypoints", () => {
		const s0 = getInitialState();
		const before = s0.sorcerer.manifestInfo.entrypoints.length;
		const s1 = inspectorReducer(s0, makeSorAction("panel"));
		const s2 = inspectorReducer(s1, makeSorAction("command"));
		expect(s2.sorcerer.manifestInfo.entrypoints.length).toBe(before + 2);
	});

	test("SET_MAIN merges into manifestInfo", () => {
		const s = inspectorReducer(getInitialState(), setMainAction({name: "MyPlugin", version: "9.9.9"}));
		expect(s.sorcerer.manifestInfo.name).toBe("MyPlugin");
		expect(s.sorcerer.manifestInfo.version).toBe("9.9.9");
	});

	test("SET_SNIPPET updates a snippet by uuid", () => {
		const s0 = getInitialState();
		const firstSnippetUuid = (s0.sorcerer.snippets.list[0] as any).$$$uuid as string;
		const s1 = inspectorReducer(
			s0,
			setSnippetAction({code: "// new"}, firstSnippetUuid),
		);
		const updated = s1.sorcerer.snippets.list.find(x => (x as any).$$$uuid === firstSnippetUuid);
		expect((updated as any).code).toBe("// new");
	});
});

// ---------------------------------------------------------------------------
// 3) Reducer purity (no in-place mutation)
// ---------------------------------------------------------------------------

describe("reducer purity", () => {
	test("inspector reducer never mutates the previous state object identity", () => {
		const s0 = getInitialState();
		const frozen = JSON.parse(JSON.stringify(s0));
		const s1 = inspectorReducer(s0, setModeTabAction("difference"));
		expect(s1).not.toBe(s0);
		// Old state structure must be preserved byte-for-byte.
		expect(s0).toEqual(frozen);
	});
});

// ---------------------------------------------------------------------------
// 4) Full store integration – snapshot of a representative sequence
// ---------------------------------------------------------------------------

describe("full store – end-to-end sequence", () => {
	test("dispatching a sequence produces a stable state snapshot", () => {
		const {store, dispatched} = makeStore();

		store.dispatch(setModeTabAction("difference"));
		store.dispatch(setFontSizeAction("size-big"));
		store.dispatch(setSelectedReferenceTypeAction("document"));
		store.dispatch(addDescriptorAction(makeDescriptor("d1"), false));
		store.dispatch(addDescriptorAction(makeDescriptor("d2"), false));
		store.dispatch(selectDescriptorAction("replace", "d1"));
		store.dispatch(lockDescAction(true, ["d2"]));
		store.dispatch(setListenerAction(true));
		store.dispatch(setDataAction([makeAtnSet("set-a")]));
		store.dispatch(setExpandActionAction(["set-a"], true, false));
		store.dispatch(makeSorAction("snippet"));
		store.dispatch(setMainAction({name: "SnapshotPlugin"}));

		const state = store.getState().inspector;

		// Hand-picked, migration-stable assertions (these stay the same
		// regardless of whether the slice is written with classic Redux
		// or with createSlice/createReducer):
		expect(state.inspector.activeTab).toBe("difference");
		expect(state.settings.fontSize).toBe("size-big");
		expect(state.selectedReferenceType).toBe("document");
		expect(state.descriptors.map(d => d.id)).toEqual(["d1", "d2"]);
		expect(state.descriptors.find(d => d.id === "d1")?.selected).toBe(true);
		expect(state.descriptors.find(d => d.id === "d2")?.locked).toBe(true);
		expect(state.settings.autoUpdateListener).toBe(true);
		expect(state.atnConverter.data.map(x => x.__uuid__)).toEqual(["set-a"]);
		expect(state.atnConverter.expandedItems.length).toBeGreaterThan(0);
		expect(state.sorcerer.manifestInfo.name).toBe("SnapshotPlugin");

		// Snapshot guards against any *other* drift. Random UUIDs are
		// stripped so the snapshot stays deterministic across runs.
		// Delete the .snap file once after the migration is verified to
		// re-baseline (or run `npx jest -u`).
		const stable = JSON.parse(
			JSON.stringify(state)
				.replace(
					/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
					"<uuid>",
				)
				.replace(/s_[0-9a-f]{32}/gi, "<sUuid>"),
		);
		expect(stable).toMatchSnapshot("inspector-state-after-sequence");

		// Each action should have been a plain object (a Redux invariant).
		for (const a of dispatched) {
			expect(typeof a).toBe("object");
			expect(typeof a.type).toBe("string");
			expect(a.type.length).toBeGreaterThan(0);
		}
	});
});
