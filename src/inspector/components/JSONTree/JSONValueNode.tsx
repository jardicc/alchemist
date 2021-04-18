/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from "react";
import PropTypes from "prop-types";
import { ISimpleNodeProps } from "./types";

/**
 * Renders simple values (eg. strings, numbers, booleans, etc)
 */

export const JSONValueNode = ({
	nodeType,
	labelRenderer,
	keyPath,
	valueRenderer,
	value,
	valueGetter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}:ISimpleNodeProps&{valueGetter:(value:any)=>any}) => (
	<li className="value">
		<label className="label valueLabel">
			{labelRenderer(keyPath, nodeType, false, false)}
		</label>
		<span className={"valueText "+nodeType}>
			{
				valueRenderer(valueGetter(value), value, nodeType, ...keyPath)
			}
		</span>
	</li>
);

JSONValueNode.propTypes = {
	nodeType: PropTypes.string.isRequired,
	labelRenderer: PropTypes.func.isRequired,
	keyPath: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.string, PropTypes.number])
	).isRequired,
	valueRenderer: PropTypes.func.isRequired,
	value: PropTypes.any,
	valueGetter: PropTypes.func
};

JSONValueNode.defaultProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	valueGetter: (value:any) => value
};
