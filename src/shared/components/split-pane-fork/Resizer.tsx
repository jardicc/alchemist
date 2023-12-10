import React from "react";

export const RESIZER_DEFAULT_CLASSNAME = "Resizer";

export class Resizer extends React.Component<IResizerProps> {

	constructor(props: IResizerProps) {
		super(props);
	}

	public override render() {
		const {
			className,
			onClick,
			onDoubleClick,
			onMouseDown,
			onTouchEnd,
			onTouchStart,
			resizerClassName,
			split,
			style,
		} = this.props;
		const classes = [(resizerClassName || RESIZER_DEFAULT_CLASSNAME), split, className];

		return (
			<span
				role="presentation"
				className={classes.join(" ")}
				style={style}
				onMouseDown={event => onMouseDown && onMouseDown(event)}
				onTouchStart={event => {
					event.preventDefault();
					onTouchStart && onTouchStart(event);
				}}
				onTouchEnd={event => {
					event.preventDefault();
					onTouchEnd && onTouchEnd(event);
				}}
				onClick={event => {
					if (onClick) {
						event.preventDefault();
						onClick(event);
					}
				}}
				onDoubleClick={event => {
					if (onDoubleClick) {
						event.preventDefault();
						onDoubleClick(event);
					}
				}}
			/>
		);
	}
}

interface IResizerProps {
	className?: string
	onClick?: React.MouseEventHandler<HTMLSpanElement>
	onDoubleClick?: React.MouseEventHandler<HTMLSpanElement>
	onMouseDown?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void
	onTouchStart?: React.TouchEventHandler<HTMLSpanElement>
	onTouchEnd?: React.TouchEventHandler<HTMLSpanElement>
	split?: "vertical" | "horizontal"
	style?: React.CSSProperties
	resizerClassName?: string
}