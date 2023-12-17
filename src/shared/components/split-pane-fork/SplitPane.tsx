import React from "react";

import {Pane} from "./Pane";
import {Resizer, RESIZER_DEFAULT_CLASSNAME} from "./Resizer";
import {clone, cloneDeep} from "lodash";

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

interface ISplitPaneState {
	active: boolean;
	resized: boolean;
	position: number;
	draggedSize: number;
	pane1Size?: number;
	pane2Size?: number;
	instanceProps: {
		size?: Size;
	};
}

export class SplitPane extends React.Component<ISplitPaneProps, ISplitPaneState> {

	private splitPane = React.createRef<HTMLDivElement>();
	private pane1!: HTMLDivElement;
	private pane2!: HTMLDivElement;

	constructor(props: ISplitPaneProps) {
		super(props);

		this.onMouseDown = this.onMouseDown.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);

		// order of setting panel sizes.
		// 1. size
		// 2. getDefaultSize(defaultSize, minsize, maxSize)

		const {size, defaultSize, minSize, maxSize, primary} = props;

		const initialSize =
			size !== undefined
				? size
				: getDefaultSize(defaultSize, minSize, maxSize, null);

		this.state = {
			active: false,
			resized: false,
			pane1Size: primary === "first" ? initialSize : undefined,
			pane2Size: primary === "second" ? initialSize : undefined,

			// these are props that are needed in static functions. ie: gDSFP
			instanceProps: {
				size,
			},
			draggedSize: 50,
			position: 50,
		};
	}



	public override componentDidMount() {
		if (this.splitPane.current === null) return;
		this.splitPane.current.addEventListener("mouseup", this.onMouseUp);
		this.splitPane.current.addEventListener("mousemove", this.onMouseMove);
		this.splitPane.current.addEventListener("touchmove", this.onTouchMove);
		this.setState(SplitPane.getSizeUpdate(this.props, this.state));
	}

	static getDerivedStateFromProps(nextProps: ISplitPaneProps, prevState: ISplitPaneState) {
		return SplitPane.getSizeUpdate(nextProps, prevState);
	}

	public override componentWillUnmount() {
		if (this.splitPane.current === null) return;
		this.splitPane.current.removeEventListener("mouseup", this.onMouseUp);
		this.splitPane.current.removeEventListener("mousemove", this.onMouseMove);
		this.splitPane.current.removeEventListener("touchmove", this.onTouchMove);
	}

	public onMouseDown(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
		const eventWithTouches = Object.assign({}, event, {
			touches: [{clientX: event.clientX, clientY: event.clientY}],
		});
		this.onTouchStart(eventWithTouches as any);
	}

	public onTouchStart: React.TouchEventHandler<HTMLSpanElement> = (event) => {
		const {allowResize, onDragStarted, split} = this.props;
		if (allowResize) {
			unFocus(document, window);
			const position =
				split === "vertical"
					? event.touches[0].clientX
					: event.touches[0].clientY;

			if (typeof onDragStarted === "function") {
				onDragStarted();
			}
			this.setState({
				active: true,
				position,
			});
		}
	}

	public onMouseMove(event: MouseEvent) {
		if (event.buttons !== 1) {
			return;
		}
		const eventWithTouches = Object.assign({}, event, {
			touches: [{clientX: event.clientX, clientY: event.clientY}],
		});
		this.onTouchMove(eventWithTouches as any);
	}

	public onTouchMove(event: TouchEvent) {
		const {allowResize, maxSize, minSize: _minSize, onChange, split} = this.props;
		const {
			active,
			position,
		} = this.state;
		//console.log("onTouchMove", event.touches[0].clientX);
		//debugger;
		//event.stopPropagation();

		const minSize = _minSize as number;

		if (allowResize && active) {
			unFocus(document, window);
			const isPrimaryFirst = this.props.primary === "first";
			const ref = isPrimaryFirst ? this.pane1 : this.pane2;
			if (ref) {
				const nodeContainer = this.splitPane.current;

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

				if (onChange) onChange(currentPos);

				this.setState({
					...this.state,
					draggedSize: currentPos,
					[isPrimaryFirst ? "pane1Size" : "pane2Size"]: currentPos,
				});
			}
		}
	}

	public onMouseUp() {
		const {allowResize, onDragFinished} = this.props;
		const {active, draggedSize} = this.state;
		if (allowResize && active) {
			if (typeof onDragFinished === "function") {
				onDragFinished(draggedSize);
			}
			this.setState({active: false});
		}
	}

	// we have to check values since gDSFP is called on every render and more in StrictMode
	static getSizeUpdate(props: ISplitPaneProps, state: ISplitPaneState): ISplitPaneState {
		const newState: ISplitPaneState = cloneDeep(state);
		const {instanceProps} = state;

		if (instanceProps.size === props.size && props.size !== undefined) {
			return state;
		}

		const newSize =
			props.size !== undefined
				? props.size
				: getDefaultSize(
					props.defaultSize,
					props.minSize,
					props.maxSize,
					state.draggedSize,
				);

		if (props.size !== undefined) {
			newState.draggedSize = newSize;
		}

		const isPanel1Primary = props.primary === "first";

		newState[isPanel1Primary ? "pane1Size" : "pane2Size"] = newSize;
		newState[isPanel1Primary ? "pane2Size" : "pane1Size"] = undefined;

		newState.instanceProps = {size: props.size};

		return newState;
	}

	public override render() {
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
		} = this.props;

		const {pane1Size, pane2Size} = this.state;

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

		return (
			<div
				className={classes.join(" ")}
				ref={this.splitPane}
				style={style}
			>
				<Pane
					className={pane1Classes}
					key="pane1"
					eleRef={(node) => {
						this.pane1 = node;
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
					onMouseDown={this.onMouseDown}
					onTouchStart={this.onTouchStart}
					onTouchEnd={this.onMouseUp}
					key="resizer"
					resizerClassName={resizerClassNamesIncludingDefault}
					split={split}
					style={resizerStyle || {}}
				/>
				<Pane
					className={pane2Classes}
					key="pane2"
					eleRef={(node) => {
						this.pane2 = node;
					}}
					size={pane2Size}
					split={split}
					style={pane2Style}
				>
					{notNullChildren[1]}
				</Pane>
			</div>
		);
	}
}

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