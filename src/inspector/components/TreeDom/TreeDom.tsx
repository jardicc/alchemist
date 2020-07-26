import React, { Component } from "react";
import "./TreeDom.less";
import { getItemString } from "../TreeDiff/getItemString";
import JSONTree from "./../JSONTree";
import { TProtoMode } from "../../model/types";
import { renderPath, labelRenderer } from "../shared/sharedTreeView";
import { TReference, GetInfo } from "../../classes/GetInfo";
import { cloneDeep } from "lodash";

export interface ITreeDomProps{
	content: {
		ref: TReference[]|null
		path: string[]
	}
	protoMode:TProtoMode
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreeDomDispatch {
	onInspectPath: (path: string[],mode:"replace"|"add") => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeDomState{
	
}

export type TTreeDom = ITreeDomProps & ITreeDomDispatch

export class TreeDom extends Component<TTreeDom, ITreeDomState> {

	constructor(props: TTreeDom) {
		super(props);

		this.state = {
		};
	}
	
	private labelRenderer = ([key, ...rest]: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
		return labelRenderer([key, ...rest], this.props.onInspectPath, nodeType, expanded, expandable);
	}

	private renderPath = () => {
		const { content:{path}, onInspectPath } = this.props;
		return renderPath(path, onInspectPath);
	}

	public getItemString = (type: any, data: any): JSX.Element => {
		return getItemString(type, data, true, false);
	}
	
	public render(): React.ReactNode {
		const { content, protoMode, onInspectPath } = this.props;
		if (!content?.ref) {
			return "Nothing to see there";
		}
		
		let data:any = GetInfo.getDom(content.ref);
		
		const path = cloneDeep(content.path);
		
		for (const part of path) {
			data = (data)?.[part];
		}

		// make primitive types pin-able
		if (typeof data !== "object" && data !== undefined && data !== null) {
			const lastPart = path[path.length - 1];
			data = { ["$$$noPin_"+lastPart]:data };
		}
		//console.log(content);
		return (
			<div className="TreeDom">
				<div className="path">
					{this.renderPath()}
				</div>
				
				{(content === undefined || content === null) ?
					"Content is missing. Please make sure that you selected descriptor and your pinned property exists"
					:
					<JSONTree
						data={data}
						keyPath={path}
						protoMode={protoMode}
						labelRenderer={this.labelRenderer}
						getItemString={this.getItemString} // shows object content shortcut
						hideRoot={true}
						sortObjectKeys={true}
					/>
				}
			</div>
		);
	}
}

