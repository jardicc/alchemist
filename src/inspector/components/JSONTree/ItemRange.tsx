import React from "react";
import PropTypes from "prop-types";
import {JSONArrow} from "./JSONArrow";
import { IItemRange, IItemState } from "./types";

export class ItemRange extends React.Component<IItemRange,IItemState> {
	static propTypes = {
		from: PropTypes.number.isRequired,
		to: PropTypes.number.isRequired,
		renderChildNodes: PropTypes.func.isRequired,
		nodeType: PropTypes.string.isRequired,
	};

	constructor(props:IItemRange) {
		super(props);
		this.state = { expanded: false };

		this.handleClick = this.handleClick.bind(this);
	}

	render():JSX.Element {
		const { from, to, renderChildNodes, nodeType } = this.props;		

		return this.state.expanded ? (
			renderChildNodes(this.props, from, to)
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

	handleClick=():void => {
		this.setState({ expanded: !this.state.expanded });
	};
}
