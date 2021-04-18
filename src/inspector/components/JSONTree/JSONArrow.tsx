import React from "react";
import PropTypes from "prop-types";
import { IconCaretRight, IconCaretBottom, IconArrowThickRight, IconArrowThickBottom } from "../../../shared/components/icons";
import { IArrow } from "./types";

function getSingle(expanded: boolean) {
	return !expanded ? <IconCaretRight /> : <IconCaretBottom />;
}
function getDouble(expanded: boolean) {
	return !expanded ? <IconArrowThickRight /> : <IconArrowThickBottom />;
}

export const JSONArrow = ({arrowStyle, expanded, onClick }:IArrow):JSX.Element => (
	<div onClick={onClick} className="arrowContainer">
		<div className="arrow">
			{arrowStyle === "single" ? getSingle(expanded) : getDouble(expanded)}
		</div>
	</div>
);

JSONArrow.propTypes = {
	arrowStyle: PropTypes.oneOf(["single", "double"]),
	expanded: PropTypes.bool.isRequired,
	nodeType: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
};

JSONArrow.defaultProps = {
	arrowStyle: "single",
};
