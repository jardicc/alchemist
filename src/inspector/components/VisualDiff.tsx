import React from "react";
import "./VisualDiff.less";
import {formatters, diff} from "jsondiffpatch";

export interface IVisualDiffProps {
	left: any
	right: any
}

export const VisualDiffTab: React.FC<IVisualDiffProps> = (props) => {
	const elRef = React.useRef<HTMLDivElement | null>(null);

	const {left, right} = props;
	if (!left || !right) {
		return <>{"n/a"}</>;
	}

	const delta = diff(left, right);
	if (!delta) {
		return <>{"Content is same"}</>;
	}
	const __html = formatters.html.format(delta, left);

	const element = <div className="VisualDiff" dangerouslySetInnerHTML={{__html}} ref={(ref) => { elRef.current = ref; }} />;
	formatters.html.hideUnchanged(elRef.current, 500);
	//jsondiffpatch.formatters.html.showUnchanged(true, elRef.current, 10);

	return element;
};
