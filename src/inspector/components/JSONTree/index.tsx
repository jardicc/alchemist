// ES6 + inline style port of JSONViewer https://bitbucket.org/davevedder/react-json-viewer/
// all credits and original code to the author
// Dave Vedder <veddermatic@gmail.com> http://www.eskimospy.com/
// port by Daniele Zannotti http://www.github.com/dzannotti <dzannotti@me.com>

import React from "react";
import PropTypes from "prop-types";
import JSONNode from "./JSONNode";
import "./JSONTree.less";

const identity = (displayValue: string | number, rawValue: string | number | boolean | null, nodeType:string, ...keyPath: (string | number)[]): React.ReactNode => {
	if (nodeType === "Function") { return "fn()"; }
	return displayValue;
};
const expandRootNode = (keyName:any, data:any, level:any) => (level <= 0);
const defaultItemString = (type:any, data:any, itemType:any, itemString:any) => (
	<span>
		{itemType} {itemString}
	</span>
);
const defaultLabelRenderer = ([label]:any) => <span>{label}:</span>;
const noCustomNode = () => false;

type TNonNullish = Record<string, unknown>;

export interface IJSONTreeProps{
	data: [any] |TNonNullish;
	hideRoot?: boolean;
	theme?: TNonNullish | string;
	invertTheme?: boolean;
	keyPath?: [string | number];
}

export interface IJSONTreeDispatch {
	// eslint-disable-next-line @typescript-eslint/ban-types
	sortObjectKeys?: Function | boolean;
	shouldExpandNode?: (keyPath: (string | number)[], data: [any] | TNonNullish, level: number) => boolean;
	getItemString?: (type: string, data: [any] | TNonNullish, itemType: string, itemString: string) => JSX.Element;
	labelRenderer?: (keyPath: string[], nodeType?: string, expanded?: boolean, expandable?: boolean) => JSX.Element;
	valueRenderer?: (displayValue: string|number, rawValue: string|number|boolean|null, nodeType:string, ...keyPath: (string|number)[]) => JSX.Element;
	postprocessValue?: (raw: string) => JSX.Element;
	isCustomNode?: () => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ITreeContentState{
	
}

export type TJSONTree = IJSONTreeProps & IJSONTreeDispatch

export default class JSONTree extends React.Component<TJSONTree,ITreeContentState> {
	static propTypes = {
		data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
		hideRoot: PropTypes.bool,
		theme: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
		invertTheme: PropTypes.bool,
		keyPath: PropTypes.arrayOf(
			PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		),
		postprocessValue: PropTypes.func,
		sortObjectKeys: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
		protoMode: PropTypes.string
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
		invertTheme: true,
		protoMode: "none"
	};

	constructor(props:any) {
		super(props);
	}

	shouldComponentUpdate(nextProps: any) {
		// consider to optimize
		return true;
	}

	render() {
		const {
			data: value,
			keyPath,
			postprocessValue,
			hideRoot,
			invertTheme: _, // eslint-disable-line no-unused-vars
			...rest
		}: any = this.props;
		

		return (
			<ul className="JSONTree">
				<JSONNode
					{...{ postprocessValue, hideRoot, ...rest }}
					keyPath={hideRoot ? [] : keyPath}
					value={postprocessValue(value)}					
				/>
			</ul>
		);
	}
}
