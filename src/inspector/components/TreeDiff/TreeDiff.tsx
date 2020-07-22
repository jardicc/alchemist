import React, { Component } from "react";
import "./TreeDiff.less";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import JSONDiff from "../JSONDiff/JSONDiff";
import { diff } from "jsondiffpatch";

export interface ITreeDiffProps{
	left: any
	right: any
	path:string[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreeDiffDispatch {
	onInspectPath: (path: string[],mode:"replace"|"add") => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeDiffState{
	
}

export type TTreeDiff = ITreeDiffProps & ITreeDiffDispatch

const theme = {
	scheme: "monokai",
	author: "wimer hazenberg (http://www.monokai.nl)",
	base00: "#272822",
	base01: "#383830",
	base02: "#49483e",
	base03: "#75715e",
	base04: "#a59f85",
	base05: "#f8f8f2",
	base06: "#f5f4f1",
	base07: "#f9f8f5",
	base08: "#f92672",
	base09: "#fd971f",
	base0A: "#f4bf75",
	base0B: "#a6e22e",
	base0C: "#a1efe4",
	base0D: "#66d9ef",
	base0E: "#ae81ff",
	base0F: "#cc6633"
};

export class TreeDiff extends Component<TTreeDiff, ITreeDiffState> {

	constructor(props: TTreeDiff) {
		super(props);

		this.state = {
		};
	}

	private renderPath = () => {
		const { path, onInspectPath } = this.props;
		const parts: React.ReactNode[] = [
			<span className="pathItem" key="root" onClick={() => { onInspectPath([],"replace"); }}>
				<span className="link">root</span>
			</span>
		];
		for (let i = 0, len = path.length; i < len; i++) {
			parts.push(
				<span className="pathItem" key={i} onClick={() => { onInspectPath(path.slice(0, i + 1),"replace"); }}>
					<span className="link">{path[i]}</span>
				</span>
			);
		}
		return parts;
	}
	
	public render(): React.ReactNode {
		const { left, right, onInspectPath } = this.props;
		const delta = diff(left, right);
		if (!delta && left && right) {
			return "Content is same";
		}

		return (
			<div className="TreeDiff">
				<div className="path">
					{this.renderPath()}
				</div>

				{left && right ? <JSONDiff
					base16Theme={theme}
					delta={delta}
					invertTheme={false}
					isWideLayout={false}
					onInspectPath={onInspectPath}
				/> : "Select 2 descriptors"}
			</div>
		);
	}
}