/* eslint-disable @typescript-eslint/no-unused-vars */

// ES6 + inline style port of JSONViewer https://bitbucket.org/davevedder/react-json-viewer/
// all credits and original code to the author
// Dave Vedder <veddermatic@gmail.com> http://www.eskimospy.com/
// port by Daniele Zannotti http://www.github.com/dzannotti <dzannotti@me.com>

import React from "react";
import PropTypes from "prop-types";
import {JSONNode} from "./JSONNode";
import "./JSONTree.less";
import { IDefSettings, TShouldExpandNode, TGetItemString, TValueRenderer, TLabelRenderer, TIsCustomNode } from "./types";

const identity:TValueRenderer = (displayValue, rawValue, nodeType, ...keyPath) => {
	if (nodeType === "Function") { return "fn()"; }
	return displayValue;
};
const expandRootNode:TShouldExpandNode = (keyName, data, level) => (level <= 0);
const defaultItemString:TGetItemString = (type, data, itemType, itemString) => (
	<span>
		{itemType} {itemString}
	</span>
);
const defaultLabelRenderer:TLabelRenderer = ([label]) => <span>{label}:</span>;
const noCustomNode:TIsCustomNode = () => false;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeContentState{
	
}

export class JSONTree extends React.Component<IDefSettings,ITreeContentState> {
	static propTypes = {
		data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
		hideRoot: PropTypes.bool,
		theme: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
		keyPath: PropTypes.arrayOf(
			PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		),
		postprocessValue: PropTypes.func,
		sortObjectKeys: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
		protoMode: PropTypes.string,
	};

	static defaultProps = {
		shouldExpandNode: expandRootNode,
		hideRoot: false,
		keyPath: ["root"],
		getItemString: defaultItemString,
		labelRenderer: defaultLabelRenderer,
		valueRenderer: identity,
		postprocessValue: identity,
		isCustomNode: noCustomNode,
		collectionLimit: 50,
		protoMode: "none",
	};

	constructor(props:IDefSettings) {
		super(props);
	}

	public shouldComponentUpdate(nextProps: IDefSettings):boolean {
		// consider to optimize
		return true;
	}

	public render():JSX.Element {
		const {
			data: value,
			keyPath,
			postprocessValue,
			hideRoot,
			...rest
		} = this.props;

		return (
			<ul className="JSONTree">
				<JSONNode
					{...{ postprocessValue, hideRoot, ...rest }}
					keyPath={hideRoot ? [] : keyPath}
					value={postprocessValue(value)}
					data={value}
				/>
			</ul>
		);
	}
}
