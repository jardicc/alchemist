/**
 * @jest-environment jsdom
 */
import React from "react";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";

import {Snippet} from "../SnippetContainer";
import {Command} from "../CommandContainer";
import {Panel} from "../PanelContainer";
import {General} from "../GeneralContainer";

const makeSnippet = (over: Partial<any> = {}) => ({
	type: "snippet",
	$$$uuid: "s1",
	label: {default: "Snippet 1"},
	author: "Bob",
	version: "1.0.0",
	code: "console.log(1)",
	...over,
});

const makeCommand = (over: Partial<any> = {}) => ({
	type: "command",
	$$$uuid: "c1",
	id: "cmd1",
	label: {default: "Cmd 1"},
	$$$snippetUUID: "s1",
	...over,
});

const makePanel = (over: Partial<any> = {}) => ({
	type: "panel",
	$$$uuid: "p1",
	id: "pan1",
	label: {default: "Pan 1"},
	$$$snippetUUIDs: ["s1"],
	...over,
});

describe("<Snippet /> (sorcerer)", () => {
	it("renders nothing when activeSnippet is null", () => {
		const {container} = render(<Snippet activeSnippet={null as any} onSet={jest.fn()} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders snippet fields", () => {
		const {container} = render(<Snippet activeSnippet={makeSnippet() as any} onSet={jest.fn()} />);
		expect(container.querySelector(".SnippetContainerContainer")).not.toBeNull();
		expect(container.textContent).toMatch(/Name/);
		expect(container.textContent).toMatch(/Version/);
		expect(container.textContent).toMatch(/Author/);
		expect(container.textContent).toMatch(/Code/);
	});
});

describe("<Command /> (sorcerer)", () => {
	it("renders nothing when activeCommand is null", () => {
		const {container} = render(
			<Command activeCommand={null as any} onSet={jest.fn()} snippets={[]} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders the command panel and an option per snippet", () => {
		const {container} = render(
			<Command
				activeCommand={makeCommand() as any}
				onSet={jest.fn()}
				snippets={[makeSnippet() as any, makeSnippet({$$$uuid: "s2", label: {default: "Snippet 2"}}) as any]}
			/>,
		);
		expect(container.querySelector(".CommandContainerContainer")).not.toBeNull();
		expect(container.textContent).toMatch(/Label/);
		expect(container.textContent).toMatch(/ID/);
		expect(container.textContent).toMatch(/Snippet 1/);
		expect(container.textContent).toMatch(/Snippet 2/);
	});
});

describe("<Panel /> (sorcerer)", () => {
	it("renders nothing when activePanel is null", () => {
		const {container} = render(
			<Panel activePanel={null as any} onSet={jest.fn()} snippets={[]} onAssignSnippet={jest.fn()} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders one checkbox per snippet", () => {
		const {container} = render(
			<Panel
				activePanel={makePanel() as any}
				onSet={jest.fn()}
				snippets={[makeSnippet() as any, makeSnippet({$$$uuid: "s2", label: {default: "S2"}}) as any]}
				onAssignSnippet={jest.fn()}
			/>,
		);
		expect(container.querySelector(".PanelContainerContainer")).not.toBeNull();
		expect(container.textContent).toContain("Snippet 1");
		expect(container.textContent).toContain("S2");
	});
});

describe("<General /> (sorcerer)", () => {
	const manifest: any = {
		manifestVersion: 5,
		name: "MyPlugin",
		id: "id-123",
		main: "index.html",
		version: "2.0.0",
		host: [
			{app: "PS", minVersion: "23.0", data: {apiVersion: 2}},
		],
		entrypoints: [],
		icons: [],
		requiredPermissions: {},
	};

	it("renders nothing when isGenericVisible=false", () => {
		const {container} = render(
			<General
				manifestGeneric={manifest}
				isGenericVisible={false}
				onSet={jest.fn()}
				onSetHost={jest.fn()}
			/>,
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders the manifest fields and host info when visible", () => {
		const {container} = render(
			<General
				manifestGeneric={manifest}
				isGenericVisible
				onSet={jest.fn()}
				onSetHost={jest.fn()}
			/>,
		);
		expect(container.textContent).toContain("Main");
		expect(container.textContent).toContain("Host app");
		expect(screen.getByText("PS")).toBeInTheDocument();
	});
});
