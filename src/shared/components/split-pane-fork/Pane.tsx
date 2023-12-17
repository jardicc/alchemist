import React from "react";
import {Size, Split} from "./SplitPane";

export class Pane extends React.Component<IPaneProps> {
	constructor(props: IPaneProps) {
		super(props);
	}

	public override render() {
		const {
			children,
			className,
			split,
			style: styleProps,
			size,
			eleRef,
		} = this.props;

		const classes = ["Pane", split, className];

		let style: React.CSSProperties = {
			flexGrow: 1,
			flexShrink: 1,
			flexBasis: 0,
			position: "relative",
			outline: "none",
		};

		if (size !== undefined) {
			if (split === "vertical") {
				style.width = size;
			} else {
				style.height = size;
				style.display = "flex";
			}
			style.flex = "none";
		}

		style = Object.assign({}, style, styleProps || {});

		return (
			<div ref={eleRef} className={classes.join(" ")} style={style}>
				{children}
			</div>
		);
	}
}

interface IPaneProps {
	className?: string;
	children: React.ReactNode;
	size?: Size;
	split?: Split;
	style?: React.CSSProperties;
	eleRef?: (el: HTMLDivElement) => void;
}
