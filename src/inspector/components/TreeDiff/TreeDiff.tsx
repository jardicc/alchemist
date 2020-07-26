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
					delta={delta}
					invertTheme={false}
					isWideLayout={false}
					onInspectPath={onInspectPath}
				/> : "Select 2 descriptors"}
			</div>
		);
	}
}