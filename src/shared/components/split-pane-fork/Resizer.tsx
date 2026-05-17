import React from "react";

export const RESIZER_DEFAULT_CLASSNAME = "Resizer";

interface IResizerProps {
	className?: string
	onClick?: React.MouseEventHandler<HTMLSpanElement>
	onDoubleClick?: React.MouseEventHandler<HTMLSpanElement>
	onMouseDown?: (e: React.MouseEvent<HTMLSpanElement>) => void
	onTouchStart?: React.TouchEventHandler<HTMLSpanElement>
	onTouchEnd?: React.TouchEventHandler<HTMLSpanElement>
	split?: "vertical" | "horizontal"
	style?: React.CSSProperties
	resizerClassName?: string
}

export const Resizer: React.FC<IResizerProps> = (props) => {
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
	} = props;
	const classes = [(resizerClassName || RESIZER_DEFAULT_CLASSNAME), split, className];

	return (
		<span
			role="presentation"
			className={classes.join(" ")}
			style={style}
			onMouseDown={event => onMouseDown?.(event)}
			onTouchStart={event => {
				event.preventDefault();
				onTouchStart?.(event);
			}}
			onTouchEnd={event => {
				event.preventDefault();
				onTouchEnd?.(event);
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
};
