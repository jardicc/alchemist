import React from "react";

import {Pane} from "./Pane";
import {Resizer, RESIZER_DEFAULT_CLASSNAME} from "./Resizer";

function unFocus(document: Document, window: Window) {
	if ("selection" in document) {
		(document as any).selection.empty();
	} else {
		try {
			window?.getSelection()?.removeAllRanges();
			// eslint-disable-next-line no-empty
		} catch (e) { }
	}
}

function getDefaultSize(defaultSize: number | undefined, minSize: number | undefined, maxSize: number | undefined, draggedSize: number | null) {
	if (typeof draggedSize === "number") {
		const min = typeof minSize === "number" ? minSize : 0;
		const max =
			typeof maxSize === "number" && maxSize >= 0 ? maxSize : Infinity;
		return Math.max(min, Math.min(max, draggedSize));
	}
	if (defaultSize !== undefined) {
		return defaultSize;
	}
	return minSize ?? 0;
}

function removeNullChildren(children: React.ReactNode[]) {
	return React.Children.toArray(children).filter((c) => c);
}

export const SplitPane: React.FC<ISplitPaneProps> = (props) => {
	const splitPane = React.useRef<HTMLDivElement>(null);
	const pane1Ref = React.useRef<HTMLDivElement | null>(null);
	const pane2Ref = React.useRef<HTMLDivElement | null>(null);

	const initial = React.useMemo(() => {
		const {size, defaultSize, minSize, maxSize, primary} = props;
		const initialSize =
			size !== undefined
				? size
				: getDefaultSize(defaultSize, minSize, maxSize, null);
		return {
			pane1Size: primary === "first" ? initialSize : undefined,
			pane2Size: primary === "second" ? initialSize : undefined,
			lastSizeProp: size,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [active, setActive] = React.useState<boolean>(false);
	const [position, setPosition] = React.useState<number>(50);
	const [draggedSize, setDraggedSize] = React.useState<number>(50);
	const [pane1Size, setPane1Size] = React.useState<number | undefined>(initial.pane1Size);
	const [pane2Size, setPane2Size] = React.useState<number | undefined>(initial.pane2Size);
	const lastSizePropRef = React.useRef<Size | undefined>(initial.lastSizeProp);

	// refs for handlers reading latest values without rebinding
	const activeRef = React.useRef(active);
	const positionRef = React.useRef(position);
	const draggedSizeRef = React.useRef(draggedSize);
	const propsRef = React.useRef(props);
	React.useEffect(() => {activeRef.current = active;}, [active]);
	React.useEffect(() => {positionRef.current = position;}, [position]);
	React.useEffect(() => {draggedSizeRef.current = draggedSize;}, [draggedSize]);
	React.useEffect(() => {propsRef.current = props;});

	// Replicate getDerivedStateFromProps: react to props.size changes
	if (props.size !== lastSizePropRef.current || (props.size !== undefined && props.size !== lastSizePropRef.current)) {
		// only act when size actually changed compared to last seen instance prop
		if (lastSizePropRef.current !== props.size) {
			const newSize =
				props.size !== undefined
					? props.size
					: getDefaultSize(
						props.defaultSize,
						props.minSize,
						props.maxSize,
						draggedSize,
					);
			if (props.size !== undefined && newSize !== draggedSize) {
				// schedule via state setter (safe at render-top)
				setDraggedSize(newSize);
			}
			const isPanel1Primary = props.primary === "first";
			if (isPanel1Primary) {
				if (pane1Size !== newSize) setPane1Size(newSize);
				if (pane2Size !== undefined) setPane2Size(undefined);
			} else {
				if (pane2Size !== newSize) setPane2Size(newSize);
				if (pane1Size !== undefined) setPane1Size(undefined);
			}
			lastSizePropRef.current = props.size;
		}
	}

	const onTouchMove = React.useCallback((event: TouchEvent) => {
		const curProps = propsRef.current;
		const {allowResize, split} = curProps;
		const _minSize = curProps.minSize;
		const onChange = curProps.onChange;
		const isPrimaryFirst = curProps.primary === "first";
		// minSize cast retained to match original behavior
		void (_minSize as number);

		if (allowResize && activeRef.current) {
			unFocus(document, window);
			const ref = isPrimaryFirst ? pane1Ref.current : pane2Ref.current;
			if (ref) {
				const nodeContainer = splitPane.current;

				const containerWidth = nodeContainer?.getBoundingClientRect().width;
				const containerHeight = nodeContainer?.getBoundingClientRect().height;
				const containerLeft = nodeContainer?.getBoundingClientRect().left;
				const containerTop = nodeContainer?.getBoundingClientRect().top;

				let currentPos =
					split === "vertical"
						? event.touches[0].clientX
						: event.touches[0].clientY;
				if (containerWidth === undefined || containerHeight === undefined ||
					containerLeft === undefined || containerTop === undefined
				) {
					throw new Error("containerWidth or containerHeight is undefined");
				}
				const containerSize = split === "vertical" ? containerWidth : containerHeight;
				const containerPos = split === "vertical" ? containerLeft : containerTop;

				currentPos = isPrimaryFirst ? currentPos : (containerSize + containerPos - currentPos);

				currentPos = Math.min(containerSize - 10, currentPos);
				currentPos = Math.max(10, currentPos);

				if (onChange) onChange(currentPos);

				setDraggedSize(currentPos);
				if (isPrimaryFirst) {
					setPane1Size(currentPos);
				} else {
					setPane2Size(currentPos);
				}
			}
		}
	}, []);

	const onMouseMove = React.useCallback((event: MouseEvent) => {
		if (event.buttons !== 1) {
			return;
		}
		const eventWithTouches = Object.assign({}, event, {
			touches: [{clientX: event.clientX, clientY: event.clientY}],
		});
		onTouchMove(eventWithTouches as any);
	}, [onTouchMove]);

	const onMouseUp = React.useCallback(() => {
		const curProps = propsRef.current;
		const {allowResize, onDragFinished} = curProps;
		if (allowResize && activeRef.current) {
			if (typeof onDragFinished === "function") {
				onDragFinished(draggedSizeRef.current);
			}
			setActive(false);
		}
	}, []);

	React.useEffect(() => {
		const node = splitPane.current;
		if (node === null) return;
		node.addEventListener("mouseup", onMouseUp);
		node.addEventListener("mousemove", onMouseMove);
		node.addEventListener("touchmove", onTouchMove);
		return () => {
			node.removeEventListener("mouseup", onMouseUp);
			node.removeEventListener("mousemove", onMouseMove);
			node.removeEventListener("touchmove", onTouchMove);
		};
	}, [onMouseUp, onMouseMove, onTouchMove]);

	const onTouchStart: React.TouchEventHandler<HTMLSpanElement> = (event) => {
		const {allowResize, onDragStarted, split} = props;
		if (allowResize) {
			unFocus(document, window);
			const pos =
				split === "vertical"
					? event.touches[0].clientX
					: event.touches[0].clientY;

			if (typeof onDragStarted === "function") {
				onDragStarted();
			}
			setActive(true);
			setPosition(pos);
		}
	};

	const onMouseDown = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		const eventWithTouches = Object.assign({}, event, {
			touches: [{clientX: event.clientX, clientY: event.clientY}],
		});
		onTouchStart(eventWithTouches as any);
	};

	const {
		allowResize,
		children,
		className,
		onResizerClick,
		onResizerDoubleClick,
		paneClassName,
		pane1ClassName,
		pane2ClassName,
		paneStyle,
		pane1Style: pane1StyleProps,
		pane2Style: pane2StyleProps,
		resizerClassName,
		resizerStyle,
		split,
		style: styleProps,
	} = props;

	const disabledClass = allowResize ? "" : "disabled";
	const resizerClassNamesIncludingDefault = resizerClassName
		? `${resizerClassName} ${RESIZER_DEFAULT_CLASSNAME}`
		: resizerClassName;

	const notNullChildren = removeNullChildren(children);

	const style: React.CSSProperties = {
		display: "flex",
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0,
		height: "100%",
		position: "absolute",
		outline: "none",
		overflow: "hidden",
		MozUserSelect: "text",
		WebkitUserSelect: "text",
		msUserSelect: "text",
		userSelect: "text",
		...styleProps,
	};

	if (split === "vertical") {
		Object.assign(style, {
			flexDirection: "row",
			left: 0,
			right: 0,
		});
	} else {
		Object.assign(style, {
			bottom: 0,
			flexDirection: "column",
			minHeight: "100%",
			top: 0,
			width: "100%",
		});
	}

	const classes = ["SplitPane", className, split, disabledClass];

	const pane1Style = {...paneStyle, ...pane1StyleProps};
	const pane2Style = {...paneStyle, ...pane2StyleProps};

	const pane1Classes = ["Pane1", paneClassName, pane1ClassName].join(" ");
	const pane2Classes = ["Pane2", paneClassName, pane2ClassName].join(" ");

	// reference unused vars to keep parity with original (silences linter without altering behavior)
	void position;
	void active;

	return (
		<div
			className={classes.join(" ")}
			ref={splitPane}
			style={style}
		>
			<Pane
				className={pane1Classes}
				key="pane1"
				eleRef={(node) => {
					pane1Ref.current = node;
				}}
				size={pane1Size}
				split={split}
				style={pane1Style}
			>
				{notNullChildren[0]}
			</Pane>
			<Resizer
				className={disabledClass}
				onClick={onResizerClick}
				onDoubleClick={onResizerDoubleClick}
				onMouseDown={onMouseDown}
				onTouchStart={onTouchStart}
				onTouchEnd={onMouseUp}
				key="resizer"
				resizerClassName={resizerClassNamesIncludingDefault}
				split={split}
				style={resizerStyle || {}}
			/>
			<Pane
				className={pane2Classes}
				key="pane2"
				eleRef={(node) => {
					pane2Ref.current = node;
				}}
				size={pane2Size}
				split={split}
				style={pane2Style}
			>
				{notNullChildren[1]}
			</Pane>
		</div>
	);
};

interface ISplitPaneProps {
	allowResize: boolean;
	children: React.ReactNode[];
	className?: string;
	primary: "first" | "second";
	minSize: Size;
	maxSize?: Size;
	defaultSize?: Size;
	size?: Size;
	split: Split;
	onDragStarted?: () => void;
	onDragFinished?: (newSize: number) => void;
	onChange?: (newSize: number) => void;
	onResizerClick?: React.MouseEventHandler<HTMLSpanElement>;
	onResizerDoubleClick?: React.MouseEventHandler<HTMLSpanElement>;
	style?: React.CSSProperties;
	resizerStyle?: React.CSSProperties;
	paneStyle?: React.CSSProperties;
	pane1Style?: React.CSSProperties;
	pane2Style?: React.CSSProperties;
	resizerClassName?: string;
	//step?: number;
	paneClassName: string
	pane1ClassName: string
	pane2ClassName: string
}

export type Size = number;
export type Split = "vertical" | "horizontal";