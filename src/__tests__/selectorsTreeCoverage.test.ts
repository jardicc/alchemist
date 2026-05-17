/**
 * @jest-environment jsdom
 *
 * Coverage-driving tests for the "tree" selector modules:
 *   - inspector/selectors/inspectorCodeSelectors.ts
 *   - inspector/selectors/inspectorContentSelectors.ts
 *   - inspector/selectors/inspectorDiffSelectors.ts
 *   - inspector/selectors/inspectorDOMSelectors.ts
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

// Stub the photoshop DOM bridge so the DOM selectors don't try to call into
// the actual Photoshop API. We just need any non-falsy `getDom()` result.
jest.mock("../inspector/classes/GetDOM", () => ({
	ReferenceToDOM: jest.fn().mockImplementation(() => ({
		getDom: () => ({
			name: "Layer 1",
			bounds: {left: 0, top: 0, right: 10, bottom: 10},
			children: [{name: "child-a"}, {name: "child-b"}],
		}),
	})),
}));

import {getInitialState} from "../inspector/inspInitialState";
import {inspectorReducer} from "../inspector/reducers/reducer";
import {IInspectorState, IDescriptor} from "../inspector/model/types";
import {IRootState} from "../shared/store";

import { inspectorSlice} from "../inspector/inspectorSlice";

import * as Code from "../inspector/selectors/inspectorCodeSelectors";
import * as Content from "../inspector/selectors/inspectorContentSelectors";
import * as Diff from "../inspector/selectors/inspectorDiffSelectors";
import * as Dom from "../inspector/selectors/inspectorDOMSelectors";

const {
	addDescriptor,
	selectDescriptor,
	setAutoExpandLevel,
	setFilterState,
	setInspectorPathContent,
	setInspectorPathDiff,
	setInspectorPathDom,
	setInspectorView,
	setModeTab,
	setSearchContentKeyword,
	setSelectedReferenceType,
	setSettings,
} = inspectorSlice.actions;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _crc = 7000;
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
		recordedData: {
			_obj: "make",
			payload: {alpha: 1, beta: "needle", deep: {gamma: 2}},
		} as any,
		playAbleData: {
			_obj: "make",
			_target: [{_ref: "layer", _enum: "ordinal", _value: "targetEnum"}],
		} as any,
		calculatedReference: null,
		groupCalculatedReference: null,
		descriptorSettings: {
			supportRawDataType: "auto",
			dialogOptions: "dontDisplay",
			modalBehavior: "execute",
			synchronousExecution: false,
		} as any,
		...overrides,
	} as unknown as IDescriptor;
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

// silence console.log calls inside the selectors so test output stays clean
beforeEach(() => {
	jest.spyOn(console, "log").mockImplementation(() => undefined);
});

// ---------------------------------------------------------------------------
// inspectorContentSelectors
// ---------------------------------------------------------------------------

describe("inspectorContentSelectors", () => {
	test("trivial accessors: getInspectorContentTab/getContentPath/getContentActiveView/getSearchContentKeyword/getContentExpandedNodes/getContentExpandLevel", () => {
		const root = asRoot(reduceAll([
			setInspectorPathContent(["payload", "alpha"], "replace"),
			setInspectorView("content", "raw"),
			setSearchContentKeyword("needle"),
			setAutoExpandLevel("content", 3),
		]));

		expect(Content.getInspectorContentTab(root)).toBe(root.inspector.inspector.content);
		expect(Content.getContentPath(root)).toEqual(["payload", "alpha"]);
		expect(Content.getContentActiveView(root)).toBe("raw");
		expect(Content.getSearchContentKeyword(root)).toBe("needle");
		expect(Content.getContentExpandedNodes(root)).toEqual([]);
		expect(Content.getContentExpandLevel(root)).toBe(3);
	});

	test("getTreeContentUnfiltered – single selection follows treePath", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
			setInspectorPathContent(["payload", "deep"], "replace"),
		]));
		expect(Content.getTreeContentUnfiltered(root)).toEqual({gamma: 2});
	});

	test("getTreeContentUnfiltered – multiple selections returns array of recordedData", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			addDescriptor(desc("d2"), false),
			selectDescriptor("replace", "d1"),
			selectDescriptor("add", "d2"),
		]));
		const tree = Content.getTreeContentUnfiltered(root);
		expect(Array.isArray(tree)).toBe(true);
		expect(tree).toHaveLength(2);
	});

	test("getTreeContentUnfiltered – auto-active fallback when nothing is selected", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
		]));
		expect(Content.getTreeContentUnfiltered(root)).toEqual(
			expect.objectContaining({_obj: "make"}),
		);
	});

	test("getTreeContentUnfiltered – primitive at path is wrapped in $$$noPin_<lastKey>", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
			setInspectorPathContent(["payload", "beta"], "replace"),
		]));
		expect(Content.getTreeContentUnfiltered(root)).toEqual({"$$$noPin_beta": "needle"});
	});

	test("getActiveDescriptorContent – branches: many/auto/none", () => {
		const noneRoot = asRoot(getInitialState());
		expect(Content.getActiveDescriptorContent(noneRoot)).toBe("Add some descriptor");

		const autoRoot = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
		]));
		expect(Content.getActiveDescriptorContent(autoRoot)).toContain('"_obj"');

		const oneRoot = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		// single selection -> not wrapped in an array
		const json = Content.getActiveDescriptorContent(oneRoot);
		expect(json.trim().startsWith("{")).toBe(true);

		const manyRoot = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			addDescriptor(desc("d2"), false),
			selectDescriptor("replace", "d1"),
			selectDescriptor("add", "d2"),
		]));
		const manyJson = Content.getActiveDescriptorContent(manyRoot);
		expect(manyJson.trim().startsWith("[")).toBe(true);
	});

	test("getTreeContent – without keyword returns tree as-is", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Content.getTreeContent(root)).toEqual(
			expect.objectContaining({_obj: "make"}),
		);
	});

	test("getTreeContent – with keyword filters recursively and merges paths", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
			setSearchContentKeyword("needle"),
		]));
		const filtered = Content.getTreeContent(root) as any;
		expect(filtered?.payload?.beta).toBe("needle");
		// non-matching siblings dropped
		expect(filtered?.payload?.alpha).toBeUndefined();
	});

	test("getTreeContent – with keyword on primitive root returns primitive", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
			setInspectorPathContent(["payload", "beta"], "replace"),
			setSearchContentKeyword("needle"),
		]));
		// primitive is wrapped first; filter still produces an object with the wrapper key
		const r = Content.getTreeContent(root) as any;
		expect(r?.["$$$noPin_beta"]).toBe("needle");
	});

	test("getTreeContent – keyword matching null/undefined/number values", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1", {
				recordedData: {a: null, b: undefined, c: 42, nested: {x: 1}} as any,
			}), false),
			selectDescriptor("replace", "d1"),
			setSearchContentKeyword("null"),
		]));
		const r = Content.getTreeContent(root) as any;
		expect(r?.a).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// inspectorDiffSelectors
// ---------------------------------------------------------------------------

describe("inspectorDiffSelectors", () => {
	test("trivial accessors: getInspectorDifferenceTab/getDiffPath/getDiffActiveView/getDiffExpandedNodes/getDiffExpandLevel", () => {
		const root = asRoot(reduceAll([
			setModeTab("difference"),
			setInspectorPathDiff(["payload", "alpha"], "replace"),
			setInspectorView("diff", "raw"),
			setAutoExpandLevel("diff", 2),
		]));
		expect(Diff.getInspectorDifferenceTab(root)).toBe(root.inspector.inspector.difference);
		expect(Diff.getDiffPath(root)).toEqual(["payload", "alpha"]);
		expect(Diff.getDiffActiveView(root)).toBe("raw");
		expect(Diff.getDiffExpandedNodes(root)).toEqual([]);
		expect(Diff.getDiffExpandLevel(root)).toBe(2);
	});

	test("getLeftTreeDiff / getRightTreeDiff – follow path on selected & secondary", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1", {recordedData: {payload: {leftVal: "L"}} as any}), false),
			addDescriptor(desc("d2", {recordedData: {payload: {rightVal: "R"}} as any}), false),
			selectDescriptor("replace", "d1"),
			selectDescriptor("add", "d2"),
			setInspectorPathDiff(["payload"], "replace"),
		]));
		expect(Diff.getLeftTreeDiff(root)).toEqual({leftVal: "L"});
		expect(Diff.getRightTreeDiff(root)).toEqual({rightVal: "R"});
	});

	test("getLeftTreeDiff – falls back to autoActive when nothing is selected", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1", {recordedData: {a: 1} as any}), false),
		]));
		expect(Diff.getLeftTreeDiff(root)).toEqual({a: 1});
	});

	test("getRightTreeDiff – falls back to secondaryAutoActive when nothing is selected (difference mode)", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setModeTab("difference"),
			addDescriptor(desc("d1", {recordedData: {a: 1} as any}), false),
			addDescriptor(desc("d2", {recordedData: {a: 2} as any}), false),
		]));
		expect(Diff.getRightTreeDiff(root)).toEqual({a: 1});
	});

	test("getLeftRawDiff / getRightRawDiff cover the same paths", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1", {recordedData: {payload: {x: "L"}} as any}), false),
			addDescriptor(desc("d2", {recordedData: {payload: {x: "R"}} as any}), false),
			selectDescriptor("replace", "d1"),
			selectDescriptor("add", "d2"),
			setInspectorPathDiff(["payload", "x"], "replace"),
		]));
		expect(Diff.getLeftRawDiff(root)).toBe("L");
		expect(Diff.getRightRawDiff(root)).toBe("R");
	});
});

// ---------------------------------------------------------------------------
// inspectorDOMSelectors
// ---------------------------------------------------------------------------

describe("inspectorDOMSelectors", () => {
	test("trivial accessors", () => {
		const root = asRoot(reduceAll([
			setSelectedReferenceType("layer"),
			setInspectorPathDom(["children", 0], "replace"),
			setAutoExpandLevel("DOM", 5),
		]));
		expect(Dom.getInspectorDomTab(root)).toBe(root.inspector.inspector.dom);
		expect(Dom.getDomPath(root)).toEqual(["children", 0]);
		expect(Dom.getDomExpandedNodes(root)).toEqual([]);
		expect(Dom.getDOMExpandLevel(root)).toBe(5);
	});

	test("getTreeDom – returns {ref:null, path:[]} when nothing is selected", () => {
		const root = asRoot(getInitialState());
		expect(Dom.getTreeDom(root)).toEqual({ref: null, path: []});
	});

	test("getTreeDom – returns {ref:null, path:[]} when mainClass is 'listener'", () => {
		const root = asRoot(reduceAll([
			setSelectedReferenceType("listener"),
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Dom.getTreeDom(root)).toEqual({ref: null, path: []});
	});

	test("getTreeDom – returns the descriptor's _target ref", () => {
		const root = asRoot(reduceAll([
			setSelectedReferenceType("layer"),
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
			setInspectorPathDom(["bounds"], "replace"),
		]));
		const t = Dom.getTreeDom(root);
		expect(Array.isArray(t.ref)).toBe(true);
		expect(t.path).toEqual(["bounds"]);
	});

	test("getTreeDomInstance – walks the path on the mocked DOM result", () => {
		const root = asRoot(reduceAll([
			setSelectedReferenceType("layer"),
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
			setInspectorPathDom(["bounds", "right"], "replace"),
		]));
		expect(Dom.getTreeDomInstance(root)).toBe(10);
	});

	test("getTreeDomInstance – returns undefined when no ref is available", () => {
		const root = asRoot(getInitialState());
		expect(Dom.getTreeDomInstance(root)).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// inspectorCodeSelectors
// ---------------------------------------------------------------------------

describe("inspectorCodeSelectors", () => {
	test("getCodeContentTab / getCodeActiveView reflect initial state", () => {
		const root = asRoot(getInitialState());
		expect(Code.getCodeContentTab(root)).toBe(root.inspector.inspector.code);
		expect(Code.getCodeActiveView(root)).toBe("generated");
	});

	test("getIndentString – 'tab' yields a tab, 'spaceN' yields N spaces", () => {
		const tabRoot = asRoot(reduceAll([setSettings({indent: "tab"} as any)]));
		expect(Code.getIndentString(tabRoot)).toBe("\t");

		const sp4Root = asRoot(reduceAll([setSettings({indent: "space4"} as any)]));
		expect(Code.getIndentString(sp4Root)).toBe("    ");

		const sp2Root = asRoot(reduceAll([setSettings({indent: "space2"} as any)]));
		expect(Code.getIndentString(sp2Root)).toBe("  ");
	});

	test("getDescriptorOptions – auto-active returns the default initialDescriptorSettings", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
		]));
		const opts = Code.getDescriptorOptions(root);
		expect(opts).toBe(root.inspector.settings.initialDescriptorSettings);
	});

	test("getDescriptorOptions – multiple selected returns 'mixed' or the common value", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1", {descriptorSettings: {
				supportRawDataType: "auto",
				dialogOptions: "dontDisplay",
				modalBehavior: "execute",
				synchronousExecution: false,
			} as any}), false),
			addDescriptor(desc("d2", {descriptorSettings: {
				supportRawDataType: "rawData",
				dialogOptions: "dontDisplay",
				modalBehavior: "wait",
				synchronousExecution: false,
			} as any}), false),
			selectDescriptor("replace", "d1"),
			selectDescriptor("add", "d2"),
		]));
		const opts = Code.getDescriptorOptions(root);
		expect(opts.supportRawDataType).toBe("mixed");
		expect(opts.dialogOptions).toBe("dontDisplay");
		expect(opts.modalBehavior).toBe("mixed");
		expect(opts.synchronousExecution).toBe(false);
	});

	test("getGeneratedCode – no descriptor returns 'Add some descriptor'", () => {
		const root = asRoot(getInitialState());
		expect(Code.getGeneratedCode(root)).toBe("Add some descriptor");
	});

	test("getGeneratedCode – replies/dispatcher returns playAble info banner", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1", {originalReference: {type: "replies"} as any}), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Code.getGeneratedCode(root)).toMatch(/Alchemist can't generate code/);
	});

	test("getGeneratedCode – 'modal' wrapper renders both batchPlay + executeAsModal", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setSettings({codeImports: "require", codeWrappers: "modal", indent: "space2"} as any),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		const code = Code.getGeneratedCode(root);
		expect(code).toContain("batchPlay");
		expect(code).toContain("executeAsModal");
	});

	test("getGeneratedCode – 'batchPlay' wrapper omits executeAsModal", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setSettings({codeImports: "require", codeWrappers: "batchPlay"} as any),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		const code = Code.getGeneratedCode(root);
		expect(code).toContain("batchPlay");
		expect(code).not.toContain("executeAsModal");
	});

	test("getGeneratedCode – 'array' wrapper returns just the descriptor array", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setSettings({codeImports: "import", codeWrappers: "array"} as any),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		const code = Code.getGeneratedCode(root);
		expect(code.trim().startsWith("[")).toBe(true);
		expect(code).toContain('_obj:');
	});

	test("getGeneratedCode – 'objects' wrapper trims the outer array brackets", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setSettings({codeImports: "import", codeWrappers: "objects"} as any),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		const code = Code.getGeneratedCode(root);
		expect(code).toContain('_obj:');
		expect(code.trim().startsWith("[")).toBe(false);
	});

	test("getGeneratedCode – notifier descriptor emits a warning banner", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setSettings({codeWrappers: "batchPlay"} as any),
			addDescriptor(desc("d1", {originalReference: {type: "notifier"} as any}), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Code.getGeneratedCode(root)).toMatch(/Events recognized as notifiers/);
	});

	test("getGeneratedCode – singleQuotes flag replaces double quotes", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setSettings({codeWrappers: "batchPlay", singleQuotes: true} as any),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		const code = Code.getGeneratedCode(root);
		expect(code).not.toMatch(/"make"/);
		expect(code).toMatch(/'make'/);
	});

	test("getGeneratedCode – auto-active descriptor (no explicit selection) still renders", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setSettings({codeWrappers: "batchPlay"} as any),
			addDescriptor(desc("d1"), false),
		]));
		const code = Code.getGeneratedCode(root);
		expect(code).toContain("batchPlay");
	});

	test("getGeneratedCode – content treePath appends a `const pinned = result.<path>` line", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			setSettings({codeWrappers: "batchPlay"} as any),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
			setInspectorPathContent(["payload", "alpha"], "replace"),
		]));
		const code = Code.getGeneratedCode(root);
		expect(code).toMatch(/const pinned = result\.payload\.alpha/);
	});

	test("getGeneratedCode2 – returns 'Add some descriptor' when empty, beautified code otherwise", () => {
		const empty = asRoot(getInitialState());
		expect(Code.getGeneratedCode2(empty)).toBe("Add some descriptor");

		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1"), false),
			selectDescriptor("replace", "d1"),
		]));
		const code = Code.getGeneratedCode2(root);
		expect(code).toContain("batchPlay");
		expect(code).toContain("executeAsModal");
	});

	test("getGeneratedCode2 – replies/notifier/dispatcher returns the long playAble warning", () => {
		const root = asRoot(reduceAll([
			setFilterState("layer", "main", "off"),
			addDescriptor(desc("d1", {originalReference: {type: "notifier"} as any}), false),
			selectDescriptor("replace", "d1"),
		]));
		expect(Code.getGeneratedCode2(root)).toMatch(/Alchemist can't generate code/);
	});
});
