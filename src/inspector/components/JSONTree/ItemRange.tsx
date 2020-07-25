import React from "react";
import PropTypes from "prop-types";
import {JSONArrow} from "./JSONArrow";

export default class ItemRange extends React.Component<any,any> {
	static propTypes = {
		from: PropTypes.number.isRequired,
		to: PropTypes.number.isRequired,
		renderChildNodes: PropTypes.func.isRequired,
		nodeType: PropTypes.string.isRequired
	};

	constructor(props:any) {
		super(props);
		this.state = { expanded: false } as any;

		this.handleClick = this.handleClick.bind(this);
	}

	render() {
		const { from, to, renderChildNodes, nodeType }:any = this.props;

		return this.state.expanded ? (
			<div className="itemRange">
				{renderChildNodes(this.props, from, to)}
			</div>
		) : (
			<div
				className="itemRange"
				onClick={this.handleClick}
			>
				<JSONArrow
					nodeType={nodeType}
					expanded={false}
					onClick={this.handleClick}
					arrowStyle="double"
				/>
				{`${from} ... ${to}`}
			</div>
		);
	}

	handleClick() {
		this.setState({ expanded: !this.state.expanded });
	}
}
