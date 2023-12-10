import React from "react";
import PropTypes from "prop-types";
import {JSONNestedNode} from "./JSONNestedNode";
import {INestedNodeProps} from "./types";

// Returns the "n Items" string for this node,
// generating and caching it if it hasn't been created yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createItemString(data: any) {
	return `${data.length} ${data.length !== 1 ? "items" : "item"}`;
}

// Configures <JSONNestedNode> to render an Array
export const JSONArrayNode = ({data, ...props}: INestedNodeProps): JSX.Element => (
	<JSONNestedNode
		{...props}
		data={data}
		nodeType="Array"
		nodeTypeIndicator="[]"
		createItemString={createItemString}
		expandable={data.length > 0}
	/>
);

JSONArrayNode.propTypes = {
	data: PropTypes.array,
};
