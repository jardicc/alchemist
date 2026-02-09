import React, {useRef, useEffect, useState, useCallback} from "react";

interface BaseProps {
	itemHeight: number;
	overscan?: number;
	className?: string;
	fixedHeight?: number;
	autoHeight?: {maxHeight:number};
	/** If true, container will fill available space using flexbox. Requires parent with display: flex */
	flex?: boolean;
}

interface ItemsProps extends BaseProps {
	items: React.ReactElement[];
	itemCount?: never;
	renderItem?: never;
}

interface RenderProps extends BaseProps {
	items?: never;
	itemCount: number;
	renderItem: (index: number) => React.ReactElement;
}

export type IVirtualScrollProps = ItemsProps | RenderProps;

/** VirtualScroll is a React component that efficiently renders a large list of items by only rendering the visible items within a scrollable container. */
export function VirtualScroll({
	items,
	itemCount: itemCountProp,
	renderItem,
	itemHeight,
	fixedHeight,
	overscan = 3,
	className = "",
	autoHeight,
	flex = false,
}: IVirtualScrollProps) {
	const count = items ? items.length : itemCountProp!;
	// validate props
	if (itemHeight <= 0) {
		throw new Error("itemHeight must be greater than 0");
	}
	if (autoHeight && typeof fixedHeight === "number") {
		throw new Error("containerHeight should not be provided when autoHeight is provided");
	}
	if (flex && (autoHeight || typeof fixedHeight === "number")) {
		throw new Error("flex mode cannot be used with fixedHeight or autoHeight");
	}

	const maxHeight = autoHeight?.maxHeight;

	const [scrollTop, setScrollTop] = useState(0);
	const [containerHeight, setContainerHeight] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	const totalHeight = count * itemHeight;

	// Calculate effective height
	let effectiveHeight: number;
	if (flex) {
		// In flex mode, use measured container height
		effectiveHeight = containerHeight || itemHeight; // fallback to itemHeight before first measurement
	} else if (autoHeight) {
		effectiveHeight = totalHeight;
	} else if (fixedHeight) {
		effectiveHeight = fixedHeight;
	} else {
		throw new Error("Either fixedHeight, autoHeight, or flex must be provided");
	}

	if (maxHeight !== undefined) {
		effectiveHeight = Math.min(effectiveHeight, maxHeight);
	}
	if (effectiveHeight < itemHeight && autoHeight) {
		effectiveHeight = itemHeight
	}

	const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
	const endIndex = Math.min(
		count - 1,
		Math.ceil((scrollTop + effectiveHeight) / itemHeight) + overscan
	);

	const visibleItems: React.ReactElement[] = [];
	for (let i = startIndex; i <= endIndex; i++) {
		visibleItems.push(items ? items[i] : renderItem!(i));
	}

	const handleScroll = useCallback((e: Event) => {
		const target = e.target as HTMLDivElement;
		setScrollTop(target.scrollTop);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		container.addEventListener("scroll", handleScroll);
		
		// Setup ResizeObserver for flex mode
		let resizeObserver: ResizeObserver | null = null;
		if (flex) {
			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setContainerHeight(entry.contentRect.height);
				}
			});
			resizeObserver.observe(container);
			// Set initial height
			setContainerHeight(container.clientHeight);
		}

		return () => {
			container.removeEventListener("scroll", handleScroll);
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, [handleScroll, flex]);

	return (
		<div
			ref={containerRef}
			className={className}
			style={{
				height: flex ? "100%" : `${effectiveHeight}px`,
				overflow: "auto",
				position: "relative",
				...(flex && {flexGrow: 1, flexShrink: 1, flexBasis: 0, minHeight: 0}),
			}}
		>
			<div style={{height: `${totalHeight}px`, position: "relative"}}>
				<div
					style={{
						position: "absolute",
						top: `${startIndex * itemHeight}px`,
						left: 0,
						right: 0,
					}}
				>
					{visibleItems.map((element, idx) => (
						<div
							key={element.key ?? startIndex + idx}
							style={{height: `${itemHeight}px`, overflow: "hidden"}}
						>
							{element}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
