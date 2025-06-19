import React, {Component} from "react";
import "./VisualDiff.less";
import {formatters, diff} from "jsondiffpatch";

export interface IVisualDiffProps {
	left: any
	right: any
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IVisualDiffDispatch {

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IVisualDiffState {

}

export type TVisualDiff = IVisualDiffProps & IVisualDiffDispatch

export class VisualDiffTab extends Component<TVisualDiff, IVisualDiffState> {

	constructor(props: TVisualDiff) {
		super(props);

		this.state = {
		};
	}

	private el: HTMLDivElement | null = null;

	public override render(): React.ReactNode {

		let __html;
		const {left, right} = this.props;
		if (left && right) {
			const delta = diff(left, right);
			if (!delta) {
				return "Content is same";
			}
			__html = formatters.html.format(delta, left);

			const element = <div className="VisualDiff" dangerouslySetInnerHTML={{__html}} ref={(ref) => this.el = ref} />;
			formatters.html.hideUnchanged(this.el, 500);
			//jsondiffpatch.formatters.html.showUnchanged(true, this.el, 10);

			return element;
		}
		return "n/a";
	}
}