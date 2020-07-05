import React from "react";

export const checkmark = <sp-icon class="checkmark" name="ui:CheckmarkSmall" size="xxs" />;
export const checkmarkTransparent = <sp-icon class="checkmarkTransparent" style={{color:"transparent"}} name="ui:CheckmarkSmall" size="xxs" />;

export function showCheckmark(bool: boolean):JSX.Element {
	if (bool) {
		return <React.Fragment>[{checkmark}]</React.Fragment>;
	} else {
		return <React.Fragment>[{checkmarkTransparent}]</React.Fragment>;
	}
}