import React, { useState, useRef, useCallback, useEffect } from "react";
import ENGINE from "../../logic/engine";
import Visual, { IVisual } from "../../logic/visual";
import styles from "./styles/CanvasResizeHandles.module.scss";

export type HandleDirection = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface PreviewState {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface CanvasResizeHandlesProps {
	element: Visual;
	scale?: number;
	onResize?: (preview: PreviewState | null) => void;
}

interface DragInitialState {
	direction: HandleDirection;
	startX: number;
	startY: number;
	startContentWidth: number;
	startContentHeight: number;
	startElemX: number;
	startElemY: number;
	startDrawCX: number;
	startDrawCY: number;
	isFree: boolean;
	effectiveScale: number;
	element: Visual;
}

interface ResizeResult {
	width: number;
	height: number;
	elemX: number;
	elemY: number;
	drawCX: number;
	drawCY: number;
}

const MIN_SIZE = 5;

const HANDLE_DIRECTIONS: HandleDirection[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const DIRECTION_CLASS_MAP: Record<HandleDirection, string> = {
	nw: styles.handleNw,
	n: styles.handleN,
	ne: styles.handleNe,
	e: styles.handleE,
	se: styles.handleSe,
	s: styles.handleS,
	sw: styles.handleSw,
	w: styles.handleW
};

const DIRECTION_CURSOR_MAP: Record<HandleDirection, string> = {
	nw: "nwse-resize",
	n: "ns-resize",
	ne: "nesw-resize",
	e: "ew-resize",
	se: "nwse-resize",
	s: "ns-resize",
	sw: "nesw-resize",
	w: "ew-resize"
};

function computeResizeGeometry(
	direction: HandleDirection,
	deltaX: number,
	deltaY: number,
	startWidth: number,
	startHeight: number,
	startX: number,
	startY: number,
	startDrawCX: number,
	startDrawCY: number,
	isFree: boolean
): ResizeResult {
	let targetWidth = startWidth;
	let targetHeight = startHeight;
	let newElemX = startX;
	let newElemY = startY;
	let newDrawCX = startDrawCX;
	let newDrawCY = startDrawCY;

	// Width / X calculations
	if (direction === "e" || direction === "ne" || direction === "se") {
		targetWidth = Math.max(MIN_SIZE, Math.round(startWidth + deltaX));
	} else if (direction === "w" || direction === "nw" || direction === "sw") {
		targetWidth = Math.max(MIN_SIZE, Math.round(startWidth - deltaX));
		const actualDeltaX = startWidth - targetWidth;
		if (isFree) {
			newElemX = Math.round(startX + actualDeltaX);
		}
		newDrawCX = Math.round(startDrawCX + actualDeltaX);
	}

	// Height / Y calculations
	if (direction === "s" || direction === "se" || direction === "sw") {
		targetHeight = Math.max(MIN_SIZE, Math.round(startHeight + deltaY));
	} else if (direction === "n" || direction === "ne" || direction === "nw") {
		targetHeight = Math.max(MIN_SIZE, Math.round(startHeight - deltaY));
		const actualDeltaY = startHeight - targetHeight;
		if (isFree) {
			newElemY = Math.round(startY + actualDeltaY);
		}
		newDrawCY = Math.round(startDrawCY + actualDeltaY);
	}

	return {
		width: targetWidth,
		height: targetHeight,
		elemX: newElemX,
		elemY: newElemY,
		drawCX: newDrawCX,
		drawCY: newDrawCY
	};
}

export const CanvasResizeHandles: React.FC<CanvasResizeHandlesProps> = React.memo(
	function CanvasResizeHandles({ element, scale = 1, onResize }: CanvasResizeHandlesProps) {
		const [previewState, setPreviewState] = useState<PreviewState | null>(null);
		const [activeDirection, setActiveDirection] = useState<HandleDirection | null>(null);

		// Keep refs to latest element, scale, and onResize so drag listeners always have the freshest values
		const elementRef = useRef(element);
		elementRef.current = element;

		const scaleRef = useRef(scale);
		scaleRef.current = scale;

		const onResizeRef = useRef(onResize);
		onResizeRef.current = onResize;

		// Clean up any ongoing drag on unmount
		const dragCleanupRef = useRef<(() => void) | null>(null);
		useEffect(() => {
			return () => {
				if (dragCleanupRef.current) {
					dragCleanupRef.current();
					dragCleanupRef.current = null;
				}
			};
		}, []);

		const startResize = useCallback((direction: HandleDirection, clientX: number, clientY: number) => {
			const currentElement = elementRef.current;
			const isFree = currentElement.placementMode.type === "free";
			const rawScale = scaleRef.current;
			const effectiveScale = (rawScale && rawScale > 0) ? rawScale : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);

			setActiveDirection(direction);

			const initial: DragInitialState = {
				direction,
				startX: clientX,
				startY: clientY,
				startContentWidth: currentElement.contentWidth ?? currentElement.drawContentWidth ?? 0,
				startContentHeight: currentElement.contentHeight ?? currentElement.drawContentHeight ?? 0,
				startElemX: currentElement.x ?? 0,
				startElemY: currentElement.y ?? 0,
				startDrawCX: currentElement.drawCX ?? 0,
				startDrawCY: currentElement.drawCY ?? 0,
				isFree,
				effectiveScale: effectiveScale > 0 ? effectiveScale : 1,
				element: currentElement
			};

			let latestResult: ResizeResult = {
				width: initial.startContentWidth,
				height: initial.startContentHeight,
				elemX: initial.startElemX,
				elemY: initial.startElemY,
				drawCX: initial.startDrawCX,
				drawCY: initial.startDrawCY
			};

			const initialPreview: PreviewState = {
				left: initial.startDrawCX,
				top: initial.startDrawCY,
				width: initial.startContentWidth,
				height: initial.startContentHeight
			};

			setPreviewState(initialPreview);
			onResizeRef.current?.(initialPreview);

			const handlePointerMove = (e: MouseEvent | PointerEvent) => {
				const deltaPixelsX = e.clientX - initial.startX;
				const deltaPixelsY = e.clientY - initial.startY;

				const deltaDiagramX = deltaPixelsX / initial.effectiveScale;
				const deltaDiagramY = deltaPixelsY / initial.effectiveScale;

				latestResult = computeResizeGeometry(
					initial.direction,
					deltaDiagramX,
					deltaDiagramY,
					initial.startContentWidth,
					initial.startContentHeight,
					initial.startElemX,
					initial.startElemY,
					initial.startDrawCX,
					initial.startDrawCY,
					initial.isFree
				);

				const updatedPreview: PreviewState = {
					left: latestResult.drawCX,
					top: latestResult.drawCY,
					width: latestResult.width,
					height: latestResult.height
				};

				setPreviewState(updatedPreview);
				onResizeRef.current?.(updatedPreview);
			};

			const handlePointerUp = (e: MouseEvent | PointerEvent) => {
				e.stopPropagation();
				e.stopImmediatePropagation();
				e.preventDefault();

				// Remove window event listeners immediately
				window.removeEventListener("mousemove", handlePointerMove, true);
				window.removeEventListener("mouseup", handlePointerUp, true);
				window.removeEventListener("pointermove", handlePointerMove, true);
				window.removeEventListener("pointerup", handlePointerUp, true);
				dragCleanupRef.current = null;

				setPreviewState(null);
				setActiveDirection(null);
				onResizeRef.current?.(null);

				const deltaPixelsX = e.clientX - initial.startX;
				const deltaPixelsY = e.clientY - initial.startY;

				const deltaDiagramX = deltaPixelsX / initial.effectiveScale;
				const deltaDiagramY = deltaPixelsY / initial.effectiveScale;

				const finalResult = computeResizeGeometry(
					initial.direction,
					deltaDiagramX,
					deltaDiagramY,
					initial.startContentWidth,
					initial.startContentHeight,
					initial.startElemX,
					initial.startElemY,
					initial.startDrawCX,
					initial.startDrawCY,
					initial.isFree
				);

				const widthChanged = finalResult.width !== initial.startContentWidth;
				const heightChanged = finalResult.height !== initial.startContentHeight;
				const xChanged = initial.isFree && finalResult.elemX !== initial.startElemX;
				const yChanged = initial.isFree && finalResult.elemY !== initial.startElemY;

				if (widthChanged || heightChanged || xChanged || yChanged) {
					const newState: IVisual = {
						...initial.element.state,
						contentWidth: finalResult.width,
						contentHeight: finalResult.height
					};

					if (initial.isFree) {
						newState.x = finalResult.elemX;
						newState.y = finalResult.elemY;
					}

					ENGINE.handler.act({
						type: "modify",
						input: {
							target: initial.element,
							child: newState
						}
					});
				}
			};

			// Attach window listeners with capture: true so they can't be blocked or dropped
			window.addEventListener("mousemove", handlePointerMove, true);
			window.addEventListener("mouseup", handlePointerUp, true);
			window.addEventListener("pointermove", handlePointerMove, true);
			window.addEventListener("pointerup", handlePointerUp, true);

			dragCleanupRef.current = () => {
				window.removeEventListener("mousemove", handlePointerMove, true);
				window.removeEventListener("mouseup", handlePointerUp, true);
				window.removeEventListener("pointermove", handlePointerMove, true);
				window.removeEventListener("pointerup", handlePointerUp, true);
				setActiveDirection(null);
				onResizeRef.current?.(null);
			};
		}, []);

		const handleMouseDown = useCallback(
			(direction: HandleDirection, e: React.MouseEvent) => {
				e.stopPropagation();
				e.preventDefault();
				startResize(direction, e.clientX, e.clientY);
			},
			[startResize]
		);

		const handlePointerDown = useCallback(
			(direction: HandleDirection, e: React.PointerEvent) => {
				e.stopPropagation();
				e.preventDefault();
				try {
					(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
				} catch {}
				startResize(direction, e.clientX, e.clientY);
			},
			[startResize]
		);

		const currentLeft = previewState ? previewState.left : element.drawCX;
		const currentTop = previewState ? previewState.top : element.drawCY;
		const currentWidth = previewState ? previewState.width : element.drawContentWidth;
		const currentHeight = previewState ? previewState.height : element.drawContentHeight;

		const getHandlePosition = (dir: HandleDirection): { left: number; top: number } => {
			switch (dir) {
				case "nw":
					return { left: currentLeft, top: currentTop };
				case "n":
					return { left: currentLeft + currentWidth / 2, top: currentTop };
				case "ne":
					return { left: currentLeft + currentWidth, top: currentTop };
				case "e":
					return { left: currentLeft + currentWidth, top: currentTop + currentHeight / 2 };
				case "se":
					return { left: currentLeft + currentWidth, top: currentTop + currentHeight };
				case "s":
					return { left: currentLeft + currentWidth / 2, top: currentTop + currentHeight };
				case "sw":
					return { left: currentLeft, top: currentTop + currentHeight };
				case "w":
					return { left: currentLeft, top: currentTop + currentHeight / 2 };
			}
		};

		const currentEffectiveScale = (scale && scale > 0) ? scale : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);
		const handleScale = 1 / (currentEffectiveScale > 0 ? currentEffectiveScale : 1);

		return (
			<>
				{previewState && (
					<div
						className="nopan"
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							zIndex: 99999,
							cursor: activeDirection ? DIRECTION_CURSOR_MAP[activeDirection] : "default",
							pointerEvents: "auto"
						}}
						onMouseDown={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
						onMouseMove={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
						onMouseUp={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
						onPointerDown={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
						onPointerMove={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
						onPointerUp={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
					/>
				)}
				<div
					className={`nopan ${styles.resizeHandlesContainer}`}
					style={{ "--handle-scale": handleScale } as React.CSSProperties}
					onMouseUp={(e) => e.stopPropagation()}
					onClick={(e) => e.stopPropagation()}>
					<div
						className={styles.selectionBox}
						style={{
							left: currentLeft,
							top: currentTop,
							width: currentWidth,
							height: currentHeight
						}}
					/>

					{HANDLE_DIRECTIONS.map((dir) => {
						const pos = getHandlePosition(dir);
						return (
							<div
								key={dir}
								className={`${styles.handle} ${DIRECTION_CLASS_MAP[dir]}`}
								style={{ left: pos.left, top: pos.top }}
								onMouseDown={(e) => handleMouseDown(dir, e)}
								onPointerDown={(e) => handlePointerDown(dir, e)}
								onMouseUp={(e) => e.stopPropagation()}
								onClick={(e) => e.stopPropagation()}
							/>
						);
					})}
				</div>
			</>
		);
	}
);

export default CanvasResizeHandles;
