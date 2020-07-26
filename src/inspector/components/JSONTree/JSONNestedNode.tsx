import React from "react";
import PropTypes from "prop-types";
import {JSONArrow} from "./JSONArrow";
import getCollectionEntries from "./getCollectionEntries";
import JSONNode from "./JSONNode";
import ItemRange from "./ItemRange";

/**
 * Renders nested values (eg. objects, arrays, lists, etc.)
 */

function renderChildNodes(props:any, from?:number, to?:number) {
	const {
		nodeType,
		data,
		collectionLimit,
		circularCache,
		keyPath,
		postprocessValue,
		sortObjectKeys,
		protoMode
	} = props;
	const childNodes:any = [];

	getCollectionEntries(
		protoMode,
		nodeType,
		data,
		sortObjectKeys,
		collectionLimit,
		from,
		to,
	).forEach((entry:any) => {
		if (entry.to) {
			childNodes.push(
				<ItemRange
					{...props}
					key={`ItemRange--${entry.from}-${entry.to}`}
					from={entry.from}
					to={entry.to}
					renderChildNodes={renderChildNodes}
				/>
			);
		} else {
			const { key, value } = entry;
			const isCircular = circularCache.indexOf(value) !== -1;

			const node = (
				<JSONNode
					{...props}
					{...{ postprocessValue, collectionLimit }}
					key={`Node--${key}`}
					keyPath={[key, ...keyPath]}
					value={postprocessValue(value)}
					circularCache={[...circularCache, value]}
					isCircular={isCircular}
					hideRoot={false}
				/>
			);

			if ((node as any) !== false) {
				childNodes.push(node);
			}
		}
	});

	return childNodes;
}

function getStateFromProps(props:any) {
	// calculate individual node expansion if necessary
	const expanded =
		props.shouldExpandNode && !props.isCircular
			? props.shouldExpandNode(props.keyPath, props.data, props.level)
			: false;
	return {
		expanded
	};
}

export class JSONNestedNode extends React.Component<any,any,any> {
	static propTypes = {
		getItemString: PropTypes.func.isRequired,
		nodeTypeIndicator: PropTypes.any,
		nodeType: PropTypes.string.isRequired,
		data: PropTypes.any,
		hideRoot: PropTypes.bool.isRequired,
		createItemString: PropTypes.func.isRequired,
		collectionLimit: PropTypes.number,
		keyPath: PropTypes.arrayOf(
			PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		).isRequired,
		labelRenderer: PropTypes.func.isRequired,
		shouldExpandNode: PropTypes.func,
		level: PropTypes.number.isRequired,
		sortObjectKeys: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
		isCircular: PropTypes.bool,
		expandable: PropTypes.bool,
		protoMode: PropTypes.string
	};

	static defaultProps = {
		data: [],
		circularCache: [],
		level: 0,
		expandable: true,
		protoMode: "none"
	};

	constructor(props:any) {
		super(props);
		this.state = getStateFromProps(props);
	}

	static getDerivedStateFromProps(nextProps:any, prevState:any) {
		const nextState = getStateFromProps(nextProps);
		if (getStateFromProps(nextProps).expanded !== nextState.expanded) {
			return nextState;
		}
		return null;
	}

	shouldComponentUpdate(nextProps:any, nextState:any) {
		return (
			!!Object.keys(nextProps).find(
				(key:any) =>
					key !== "circularCache" &&
					(key === "keyPath"
						? nextProps[key].join("/") !== this.props[key].join("/")
						: nextProps[key] !== this.props[key])
			) || nextState.expanded !== this.state.expanded
		);
	}

	render() {
		const {
			getItemString,
			nodeTypeIndicator,
			nodeType,
			data,
			hideRoot,
			createItemString,
			collectionLimit,
			keyPath,
			labelRenderer,
			expandable,
			protoMode,
		}: any = this.props;
		const { expanded } = this.state;
		const renderedChildren =
			expanded || (hideRoot && this.props.level === 0)
				? renderChildNodes({ ...this.props, level: this.props.level + 1 })
				: null;

		const itemType = (
			<span className="nestedNodeItemType">
				{nodeTypeIndicator}
			</span>
		);
		const renderedItemString = getItemString(
			nodeType,
			data,
			itemType,
			createItemString(data, collectionLimit)
		);
		const stylingArgs = [keyPath, nodeType, expanded, expandable];

		return hideRoot ? (
			<li className="rootNode">
				<ul className="rootNodeChildren">
					{renderedChildren}
				</ul>
			</li>
		) : (
			<li className="nestedNode">
				{expandable && (
					<JSONArrow
						nodeType={nodeType}
						expanded={expanded}
						onClick={this.handleClick}
					/>
				)}
				<label className={"label nestedNodeLabel" + ((expandable) ? " expandable":"")} onClick={this.handleClick}>
					{labelRenderer(...stylingArgs)}
				</label>
				<span className={"nestedNodeItemString" + ((expanded) ? " expanded":"")} onClick={this.handleClick}>
					
					{expanded ? null : renderedItemString}
				</span>
				<ul className={"nestedNodeChildren" + ((expanded) ? " expanded":"")} >
					{renderedChildren}
				</ul>
			</li>
		);
	}

	handleClick = () => {
		if (this.props.expandable) {
			this.setState({ expanded: !this.state.expanded });
		}
	};
}
