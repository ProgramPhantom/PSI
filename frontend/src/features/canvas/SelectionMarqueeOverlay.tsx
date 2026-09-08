import { Colors } from "@blueprintjs/core";
import React, { useEffect, useRef } from "react";
import ENGINE from "../../logic/engine";
import Visual from "../../logic/visual";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { clearSelection, setSelectedElementIds } from "../../redux/slices/applicationSlice";
import { getElementCenter, isEligibleForMultiSelect, isPointInBox } from "./selectionUtil";

interface SelectionMarqueeOverlayProps {
	zoom: number;
	isSpacePressed: boolean;
}

export const SelectionMarqueeOverlay: React.FC<SelectionMarqueeOverlayProps> = ({
	zoom,
	isSpacePressed
}) => {
	const dispatch = useAppDispatch();
	const selectedElementIds = useAppSelector((state) => state.application.selectedElementIds);
	const selectedElementIdsRef = useRef<string[]>(selectedElementIds);
	selectedElementIdsRef.current = selectedElementIds;

	const svgContainerRef = useRef<SVGSVGElement | null>(null);
	const svgRectRef = useRef<SVGRectElement | null>(null);

	const startCoordsRef = useRef<{ x: number; y: number } | null>(null);
	const cachedCanvasBoundsRef = useRef<{ left: number; top: number; zoom: number } | null>(null);
	const isAdditiveRef = useRef<boolean>(false);
	const initialSelectionRef = useRef<string[]>([]);
	const lastDispatchedIdsRef = useRef<string[]>([]);
	const isDraggingRef = useRef<boolean>(false);
	const candidateElementsRef = useRef<{ id: string; center: { x: number; y: number } }[]>([]);

	const pendingPointerRef = useRef<{ clientX: number; clientY: number; isCtrl: boolean } | null>(null);
	const rafIdRef = useRef<number | null>(null);

	const zoomRef = useRef(zoom);
	zoomRef.current = zoom;

	const isSpacePressedRef = useRef(isSpacePressed);
	isSpacePressedRef.current = isSpacePressed;

	const handleMouseDown = (e: React.MouseEvent) => {
		// Only primary left button starts marquee
		if (e.button !== 0 || isSpacePressedRef.current) {
			return;
		}

		const drawDiv = document.getElementById("diagram-root") as HTMLElement;
		const currentZoom = zoomRef.current && zoomRef.current > 0 ? zoomRef.current : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);
		const rect = drawDiv ? drawDiv.getBoundingClientRect() : { left: 0, top: 0 };

		cachedCanvasBoundsRef.current = {
			left: rect.left,
			top: rect.top,
			zoom: currentZoom
		};

		const startX = (e.clientX - rect.left) / currentZoom;
		const startY = (e.clientY - rect.top) / currentZoom;

		startCoordsRef.current = { x: startX, y: startY };
		isAdditiveRef.current = e.ctrlKey || e.metaKey;
		const currentSelected = selectedElementIdsRef.current;
		initialSelectionRef.current = [...currentSelected];
		lastDispatchedIdsRef.current = [...currentSelected];
		isDraggingRef.current = false;

		// Pre-compute eligible candidates and their centers once on mouse down
		const diagram = ENGINE.handler.diagram;
		candidateElementsRef.current = diagram.children
			.filter((el): el is Visual => isEligibleForMultiSelect(el))
			.map((el) => ({
				id: el.id,
				center: getElementCenter(el)
			}));
	};

	useEffect(() => {
		const onFrame = () => {
			rafIdRef.current = null;
			if (!startCoordsRef.current || !cachedCanvasBoundsRef.current || !pendingPointerRef.current) {
				return;
			}

			const { left, top, zoom: cachedZoom } = cachedCanvasBoundsRef.current;
			const { clientX, clientY, isCtrl } = pendingPointerRef.current;

			const currX = (clientX - left) / cachedZoom;
			const currY = (clientY - top) / cachedZoom;
			const start = startCoordsRef.current;

			const dist = Math.hypot(currX - start.x, currY - start.y);

			if (dist > 4 || isDraggingRef.current) {
				isDraggingRef.current = true;

				const minX = Math.min(start.x, currX);
				const minY = Math.min(start.y, currY);
				const maxX = Math.max(start.x, currX);
				const maxY = Math.max(start.y, currY);
				const width = maxX - minX;
				const height = maxY - minY;

				// Update SVG directly without React re-render
				if (svgContainerRef.current && svgRectRef.current) {
					svgContainerRef.current.style.display = "block";
					svgRectRef.current.setAttribute("x", String(minX));
					svgRectRef.current.setAttribute("y", String(minY));
					svgRectRef.current.setAttribute("width", String(width));
					svgRectRef.current.setAttribute("height", String(height));
				}

				// Check candidates against marquee box
				const box = { minX, minY, maxX, maxY };
				const candidates = candidateElementsRef.current;
				const containedIds: string[] = [];
				for (let i = 0; i < candidates.length; i++) {
					const cand = candidates[i];
					if (isPointInBox(cand.center, box)) {
						containedIds.push(cand.id);
					}
				}

				let nextIds: string[];
				if (isCtrl || isAdditiveRef.current) {
					nextIds = Array.from(new Set([...initialSelectionRef.current, ...containedIds]));
				} else {
					nextIds = containedIds;
				}

				// ONLY dispatch to Redux if the selection set has actually changed
				const prevIds = lastDispatchedIdsRef.current;
				let isSame = prevIds.length === nextIds.length;
				if (isSame && prevIds.length > 0) {
					const prevSet = new Set(prevIds);
					for (let i = 0; i < nextIds.length; i++) {
						if (!prevSet.has(nextIds[i])) {
							isSame = false;
							break;
						}
					}
				}

				if (!isSame) {
					lastDispatchedIdsRef.current = nextIds;
					dispatch(setSelectedElementIds(nextIds));
				}
			}
		};

		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (!startCoordsRef.current || !cachedCanvasBoundsRef.current) return;

			pendingPointerRef.current = {
				clientX: e.clientX,
				clientY: e.clientY,
				isCtrl: e.ctrlKey || e.metaKey
			};

			if (rafIdRef.current === null) {
				rafIdRef.current = requestAnimationFrame(onFrame);
			}
		};

		const handleGlobalMouseUp = (e: MouseEvent) => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}

			if (startCoordsRef.current) {
				if (!isDraggingRef.current) {
					// User simply clicked on empty canvas space without dragging
					if (!e.ctrlKey && !e.metaKey) {
						dispatch(clearSelection());
					}
				}
				startCoordsRef.current = null;
				cachedCanvasBoundsRef.current = null;
				pendingPointerRef.current = null;
				candidateElementsRef.current = [];
				isDraggingRef.current = false;

				if (svgContainerRef.current) {
					svgContainerRef.current.style.display = "none";
				}
			}
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		window.addEventListener("mouseup", handleGlobalMouseUp);

		return () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
			window.removeEventListener("mousemove", handleGlobalMouseMove);
			window.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, [dispatch]);

	return (
		<>
			{/* Backdrop to catch clicks & drags on empty canvas */}
			<div
				style={{
					position: "absolute",
					left: "-50000px",
					top: "-50000px",
					width: "100000px",
					height: "100000px",
					pointerEvents: isSpacePressed ? "none" : "auto",
					cursor: isSpacePressed ? "grab" : "default",
					zIndex: 500,
					background: "transparent"
				}}
				onMouseDown={handleMouseDown}
			/>

			{/* Live Marquee Box SVG */}
			<svg
				ref={svgContainerRef}
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					overflow: "visible",
					zIndex: 35000,
					display: "none"
				}}
			>
				<rect
					ref={svgRectRef}
					x={0}
					y={0}
					width={0}
					height={0}
					fill={`${Colors.BLUE5}`}
					fillOpacity={0.12}
					stroke={Colors.BLUE3}
					strokeWidth={1}
					strokeDasharray="3 3"
					shapeRendering="crispEdges"
				/>
			</svg>
		</>
	);
};
