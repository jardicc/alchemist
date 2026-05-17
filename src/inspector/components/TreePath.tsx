import React, {Component} from "react";
import "./TreePath.less";
import {renderPath} from "./sharedTreeView";
import SP from "react-uxp-spectrum";
import {KeyPath} from "./react-json-tree-2/types";

export interface ITreePathProps {
	autoExpandLevels: number
	path: KeyPath
	allowInfinityLevels?: boolean
	maxLevels?: number
	hideLevels?: boolean
}

export interface ITreePathDispatch {
	onInspectPath: (path: KeyPath, mode: "replace" | "add") => void;
	onSetAutoExpandLevel: (level: number) => void
}

interface ITreePathState { }

export type TTreePath = ITreePathProps & ITreePathDispatch

export const TreePath: React.FC<TTreePath> = (props) => {
	const levelDelay = React.useRef<number | null>(null);

	const renderPathFn = () => {
		const {path, onInspectPath} = props;
		return renderPath(path, onInspectPath);
	};

	const throttleSlider = (e: any) => {
		if (levelDelay.current) {
			clearTimeout(levelDelay.current);
		}
		const value = e.target.value;

		levelDelay.current = window.setTimeout(() => {
			props.onSetAutoExpandLevel(value);
		}, 50);
	};

	const {autoExpandLevels, allowInfinityLevels, hideLevels, maxLevels = 10} = props;

	return (
		<div className="TreePath">
			<div className="pathWrap">
				{renderPathFn()}
			</div>
			{!hideLevels && <div className="levelSlider">
				<span className="levelLabel">Expand: {((autoExpandLevels === maxLevels && allowInfinityLevels) ? "All" : autoExpandLevels) || "Off"}</span>
				<SP.Slider
					variant="filled"
					min={0}
					max={maxLevels}
					onInput={throttleSlider}
					//onChange={(e: any) => onSetAutoExpandLevel(e.target.value)}
					value={autoExpandLevels}
				/>
			</div>}
		</div>
	);
};
