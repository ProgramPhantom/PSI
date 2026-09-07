import { Colors } from "@blueprintjs/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ENGINE from "../../logic/engine";
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

	const [marqueeRect, setMarqueeRect] = useState<{
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
	} | null>(null);

	const startCoordsRef = useRef<{ x: number; y: number } | null>(null);
	const isAdditiveRef = useRef<boolean>(false);
	const initialSelectionRef = useRef<string[]>([]);
	const isDraggingRef = useRef<boolean>(false);

	const getCanvasCoords = useCallback(
		(e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
			const drawDiv = document.getElementById("diagram-root") as HTMLElement;
			const currentZoom = zoom && zoom > 0 ? zoom : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);
			if (!drawDiv) {
				return { x: e.clientX, y: e.clientY };
			}
			const drawDivRect = drawDiv.getBoundingClientRect();
			const relativeX = (e.clientX - drawDivRect.left) / currentZoom;
			const relativeY = (e.clientY - drawDivRect.top) / currentZoom;
			return { x: relativeX, y: relativeY };
		},
		[zoom]
	);

	const handleMouseDown = (e: React.MouseEvent) => {
		// Only primary left button starts marquee
		if (e.button !== 0 || isSpacePressed) {
			return;
		}

		const coords = getCanvasCoords(e);
		startCoordsRef.current = coords;
		isAdditiveRef.current = e.ctrlKey || e.metaKey;
		initialSelectionRef.current = [...selectedElementIds];
		isDraggingRef.current = false;
	};

	useEffect(() => {
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (!startCoordsRef.current) return;

			const curr = getCanvasCoords(e);
			const start = startCoordsRef.current;
			const dist = Math.hypot(curr.x - start.x, curr.y - start.y);

			if (dist > 4 || isDraggingRef.current) {
				isDraggingRef.current = true;

				const box = {
					minX: Math.min(start.x, curr.x),
					minY: Math.min(start.y, curr.y),
					maxX: Math.max(start.x, curr.x),
					maxY: Math.max(start.y, curr.y)
				};
				setMarqueeRect(box);

				// Find eligible elements whose center is within box
				const allElements = Object.values(ENGINE.handler.diagram.allElements);
				const containedIds = allElements
					.filter((el) => isEligibleForMultiSelect(el) && isPointInBox(getElementCenter(el), box))
					.map((el) => el.id);

				if (isAdditiveRef.current) {
					const merged = Array.from(new Set([...initialSelectionRef.current, ...containedIds]));
					dispatch(setSelectedElementIds(merged));
				} else {
					dispatch(setSelectedElementIds(containedIds));
				}
			}
		};

		const handleGlobalMouseUp = (e: MouseEvent) => {
			if (startCoordsRef.current) {
				if (!isDraggingRef.current) {
					// User simply clicked on empty canvas space without dragging
					if (!e.ctrlKey && !e.metaKey) {
						dispatch(clearSelection());
					}
				}
				startCoordsRef.current = null;
				isDraggingRef.current = false;
				setMarqueeRect(null);
			}
		};

		window.addEventListener("mousemove", handleGlobalMouseMove);
		window.addEventListener("mouseup", handleGlobalMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleGlobalMouseMove);
			window.removeEventListener("mouseup", handleGlobalMouseUp);
		};
	}, [dispatch, getCanvasCoords, isSpacePressed]);

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
			{marqueeRect && (
				<svg
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
						overflow: "visible",
						zIndex: 35000
					}}
				>
					<rect
						x={marqueeRect.minX}
						y={marqueeRect.minY}
						width={marqueeRect.maxX - marqueeRect.minX}
						height={marqueeRect.maxY - marqueeRect.minY}
						fill={`${Colors.BLUE5}`}
						fillOpacity={0.12}
						stroke={Colors.BLUE3}
						strokeWidth={1}
						strokeDasharray="3 3"
						shapeRendering="crispEdges"
					/>
				</svg>
			)}
		</>
	);
};
