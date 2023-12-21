import React, {Component} from "react";
import "./TreePath.less";
import {renderPath} from "../shared/sharedTreeView";
import SP from "react-uxp-spectrum";
import {KeyPath} from "../react-json-tree/types";

export interface ITreePathProps {
	autoExpandLevels: number
	path: KeyPath
	allowInfinityLevels?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ITreePathDispatch {
	onInspectPath: (path: KeyPath, mode: "replace" | "add") => void;
	onSetAutoExpandLevel: (level: number) => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreePathState { }

export type TTreePath = ITreePathProps & ITreePathDispatch

export class TreePath extends Component<TTreePath, ITreePathState> {

	constructor(props: TTreePath) {
		super(props);
	}


	private levelDelay: number | null = null;

	private renderPath = () => {
		const {path, onInspectPath} = this.props;
		return renderPath(path, onInspectPath);
	};

	private throttleSlider = (e: any) => {
		if (this.levelDelay) {
			clearTimeout(this.levelDelay);
		}
		const value = e.target.value;

		this.levelDelay = window.setTimeout(() => {
			this.props.onSetAutoExpandLevel(value);
		}, 50);
	};

	public override render(): React.ReactNode {
		const {autoExpandLevels, allowInfinityLevels} = this.props;

		return (
			<div className="TreePath">
				<div className="pathWrap">
					{this.renderPath()}
				</div>
				<div className="levelSlider">
					<span className="levelLabel">Expand: {((autoExpandLevels === 10 && allowInfinityLevels) ? "All" : autoExpandLevels) || "Off"}</span>
					<SP.Slider
						variant="filled"
						min={0}
						max={10}
						onInput={this.throttleSlider}
						//onChange={(e: any) => onSetAutoExpandLevel(e.target.value)}
						value={autoExpandLevels}
					/>
				</div>
			</div>
		);
	}
}