import React, {useRef, useEffect, useState, useMemo} from "react";

interface BaseProps {
	itemHeight: number;
	overscan?: number;
	className?: string;
	fixedHeight?: number;
	autoHeight?: {maxHeight:number};
	/** If true, container will fill available space using flexbox. Requires parent with display: flex */
	flex?: boolean;
	/**
	 * Scroll velocity in px/frame above which fast-scroll mode kicks in
	 * (overscan is dropped to 0 and `renderPlaceholder` is used if provided).
	 * Default 400.
	 */
	fastScrollThreshold?: number;
}

interface ItemsProps extends BaseProps {
	items: React.ReactElement[];
	itemCount?: never;
	renderItem?: never;
	/** Lightweight placeholder rendered during fast scrolling instead of the full item. */
	renderPlaceholder?: (index: number) => React.ReactElement;
}

interface RenderProps extends BaseProps {
	items?: never;
	itemCount: number;
	renderItem: (index: number) => React.ReactElement;
	/** Lightweight placeholder rendered during fast scrolling instead of the full item. */
	renderPlaceholder?: (index: number) => React.ReactElement;
}

export type IVirtualScrollProps = ItemsProps | RenderProps;

/** VirtualScroll is a React component that efficiently renders a large list of items by only rendering the visible items within a scrollable container. */
export function VirtualScroll({
	items,
	itemCount: itemCountProp,
	renderItem,
	renderPlaceholder,
	itemHeight,
	fixedHeight,
	overscan = 3,
	className = "",
	autoHeight,
	flex = false,
	fastScrollThreshold = 400,
}: IVirtualScrollProps) {
	const count = items ? items.length : itemCountProp;
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
	const [isFastScrolling, setIsFastScrolling] = useState(false);
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
		effectiveHeight = itemHeight;
	}

	// During fast scrolling, drop overscan to minimize work per frame.
	const effectiveOverscan = isFastScrolling ? 0 : overscan;

	const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - effectiveOverscan);
	const endIndex = Math.min(
		count - 1,
		Math.ceil((scrollTop + effectiveHeight) / itemHeight) + effectiveOverscan,
	);

	const visibleItems = useMemo(() => {
		const arr: React.ReactElement[] = [];
		const usePlaceholder = isFastScrolling && renderPlaceholder;
		for (let i = startIndex; i <= endIndex; i++) {
			if (usePlaceholder) {
				arr.push(renderPlaceholder(i));
			} else {
				arr.push(items ? items[i] : renderItem(i));
			}
		}
		return arr;
	}, [startIndex, endIndex, items, renderItem, renderPlaceholder, isFastScrolling]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let rafId: number | null = null;
		let pendingScrollTop = container.scrollTop;
		let lastScrollTop = container.scrollTop;
		let lastScrollTime = 0;
		let idleTimer: ReturnType<typeof setTimeout> | null = null;

		const handleScroll = () => {
			pendingScrollTop = container.scrollTop;
			if (rafId !== null) return;
			rafId = requestAnimationFrame((now) => {
				rafId = null;
				const delta = Math.abs(pendingScrollTop - lastScrollTop);
				const dt = lastScrollTime ? now - lastScrollTime : 16;
				// velocity in px per ~frame (16ms)
				const velocity = delta * (16 / Math.max(dt, 1));
				lastScrollTop = pendingScrollTop;
				lastScrollTime = now;

				if (velocity > fastScrollThreshold) {
					setIsFastScrolling((prev) => prev ? prev : true);
				}
				// reset fast-scroll flag once scrolling settles
				if (idleTimer) clearTimeout(idleTimer);
				idleTimer = setTimeout(() => {
					setIsFastScrolling((prev) => prev ? false : prev);
				}, 120);

				setScrollTop((prev) => (prev === pendingScrollTop ? prev : pendingScrollTop));
			});
		};

		container.addEventListener("scroll", handleScroll, {passive: true});

		// Setup ResizeObserver for flex mode
		let resizeObserver: ResizeObserver | null = null;
		if (flex) {
			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const h = entry.contentRect.height;
					setContainerHeight((prev) => (prev === h ? prev : h));
				}
			});
			resizeObserver.observe(container);
			// Set initial height
			setContainerHeight(container.clientHeight);
		}

		return () => {
			container.removeEventListener("scroll", handleScroll);
			if (rafId !== null) cancelAnimationFrame(rafId);
			if (idleTimer) clearTimeout(idleTimer);
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, [flex, fastScrollThreshold]);

	const containerStyle = useMemo<React.CSSProperties>(() => ({
		height: flex ? "100%" : `${effectiveHeight}px`,
		overflow: "auto",
		position: "relative",
		// Promote to its own compositor layer for smoother scrolling
		willChange: "transform",
		...(flex && {flexGrow: 1, flexShrink: 1, flexBasis: 0, minHeight: 0}),
	}), [flex, effectiveHeight]);

	const spacerStyle = useMemo<React.CSSProperties>(() => ({
		height: `${totalHeight}px`,
		position: "relative",
	}), [totalHeight]);

	const offsetStyle = useMemo<React.CSSProperties>(() => ({
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		// translate3d → GPU-composited; avoids layout pass on every scroll frame
		transform: `translate3d(0, ${startIndex * itemHeight}px, 0)`,
		willChange: "transform",
		// Disable pointer interactions during fast scroll to avoid hover/CSS work
		pointerEvents: isFastScrolling ? "none" : "auto",
	}), [startIndex, itemHeight, isFastScrolling]);

	const itemStyle = useMemo<React.CSSProperties>(() => ({
		height: `${itemHeight}px`,
		overflow: "hidden",
		// Isolate layout/paint so each item is independent
		contain: "layout style paint",
	}), [itemHeight]);

	return (
		<div ref={containerRef} className={className} style={containerStyle}>
			<div style={spacerStyle}>
				<div style={offsetStyle}>
					{visibleItems.map((element, idx) => (
						<div
							key={element.key ?? startIndex + idx}
							style={itemStyle}
						>
							{element}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
