import React, { useState, useRef, useCallback, useEffect } from "react";
import ENGINE from "../../logic/engine";
import Line, { HeadStyle, ILine } from "../../logic/line";
import LineLike, { ILineLike } from "../../logic/lineLike";
import styles from "./styles/CanvasResizeHandles.module.scss";

export type LineHandleType = "start" | "end";

export interface LinePreviewState {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

export interface CanvasLineResizeHandlesProps {
	element: LineLike;
	scale?: number;
	onResize?: (preview: LinePreviewState | null) => void;
}

interface DragInitialState {
	handle: LineHandleType;
	clientX: number;
	clientY: number;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	effectiveScale: number;
	element: LineLike;
}

const MARKER_LENGTHS: Record<HeadStyle, number> = {
	default: 3,
	thin: 4,
	none: 0
};

export const CanvasLineResizeHandles: React.FC<CanvasLineResizeHandlesProps> = React.memo(
	function CanvasLineResizeHandles({ element, scale = 1, onResize }: CanvasLineResizeHandlesProps) {
		const [previewState, setPreviewState] = useState<LinePreviewState | null>(null);
		const [activeHandle, setActiveHandle] = useState<LineHandleType | null>(null);

		const elementRef = useRef(element);
		elementRef.current = element;

		const scaleRef = useRef(scale);
		scaleRef.current = scale;

		const onResizeRef = useRef(onResize);
		onResizeRef.current = onResize;

		const dragCleanupRef = useRef<(() => void) | null>(null);
		useEffect(() => {
			return () => {
				if (dragCleanupRef.current) {
					dragCleanupRef.current();
					dragCleanupRef.current = null;
				}
			};
		}, []);

		const startResize = useCallback((handle: LineHandleType, clientX: number, clientY: number) => {
			const currentElement = elementRef.current;
			const rawScale = scaleRef.current;
			const effectiveScale = (rawScale && rawScale > 0) ? rawScale : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);

			setActiveHandle(handle);

			const initial: DragInitialState = {
				handle,
				clientX,
				clientY,
				startX: currentElement.startX,
				startY: currentElement.startY,
				endX: currentElement.endX,
				endY: currentElement.endY,
				effectiveScale: effectiveScale > 0 ? effectiveScale : 1,
				element: currentElement
			};

			const initialPreview: LinePreviewState = {
				startX: initial.startX,
				startY: initial.startY,
				endX: initial.endX,
				endY: initial.endY
			};

			setPreviewState(initialPreview);
			onResizeRef.current?.(initialPreview);

			const handlePointerMove = (e: MouseEvent | PointerEvent) => {
				const deltaPixelsX = e.clientX - initial.clientX;
				const deltaPixelsY = e.clientY - initial.clientY;

				const deltaDiagramX = deltaPixelsX / initial.effectiveScale;
				const deltaDiagramY = deltaPixelsY / initial.effectiveScale;

				let updatedStartX = initial.startX;
				let updatedStartY = initial.startY;
				let updatedEndX = initial.endX;
				let updatedEndY = initial.endY;

				if (initial.handle === "start") {
					updatedStartX = Math.round(initial.startX + deltaDiagramX);
					updatedStartY = Math.round(initial.startY + deltaDiagramY);
				} else {
					updatedEndX = Math.round(initial.endX + deltaDiagramX);
					updatedEndY = Math.round(initial.endY + deltaDiagramY);
				}

				const updatedPreview: LinePreviewState = {
					startX: updatedStartX,
					startY: updatedStartY,
					endX: updatedEndX,
					endY: updatedEndY
				};

				setPreviewState(updatedPreview);
				onResizeRef.current?.(updatedPreview);
			};

			const handlePointerUp = (e: MouseEvent | PointerEvent) => {
				e.stopPropagation();
				e.stopImmediatePropagation();
				e.preventDefault();

				window.removeEventListener("mousemove", handlePointerMove, true);
				window.removeEventListener("mouseup", handlePointerUp, true);
				window.removeEventListener("pointermove", handlePointerMove, true);
				window.removeEventListener("pointerup", handlePointerUp, true);
				dragCleanupRef.current = null;

				setActiveHandle(null);
				setPreviewState(null);
				onResizeRef.current?.(null);

				const deltaPixelsX = e.clientX - initial.clientX;
				const deltaPixelsY = e.clientY - initial.clientY;

				const deltaDiagramX = deltaPixelsX / initial.effectiveScale;
				const deltaDiagramY = deltaPixelsY / initial.effectiveScale;

				let finalStartX = initial.startX;
				let finalStartY = initial.startY;
				let finalEndX = initial.endX;
				let finalEndY = initial.endY;

				if (initial.handle === "start") {
					finalStartX = Math.round(initial.startX + deltaDiagramX);
					finalStartY = Math.round(initial.startY + deltaDiagramY);
				} else {
					finalEndX = Math.round(initial.endX + deltaDiagramX);
					finalEndY = Math.round(initial.endY + deltaDiagramY);
				}

				const hasMoved = finalStartX !== initial.startX || finalStartY !== initial.startY ||
					finalEndX !== initial.endX || finalEndY !== initial.endY;

				if (hasMoved) {
					const newLineState: ILineLike = {
						...initial.element.state,
						startX: finalStartX,
						startY: finalStartY,
						endX: finalEndX,
						endY: finalEndY,
						x: Math.min(finalStartX, finalEndX),
						y: Math.min(finalStartY, finalEndY)
					};

					ENGINE.handler.act({
						type: "modify",
						input: {
							target: initial.element,
							child: newLineState
						}
					});
				}
			};

			window.addEventListener("mousemove", handlePointerMove, true);
			window.addEventListener("mouseup", handlePointerUp, true);
			window.addEventListener("pointermove", handlePointerMove, true);
			window.addEventListener("pointerup", handlePointerUp, true);

			dragCleanupRef.current = () => {
				window.removeEventListener("mousemove", handlePointerMove, true);
				window.removeEventListener("mouseup", handlePointerUp, true);
				window.removeEventListener("pointermove", handlePointerMove, true);
				window.removeEventListener("pointerup", handlePointerUp, true);
				setActiveHandle(null);
				setPreviewState(null);
				onResizeRef.current?.(null);
			};
		}, []);

		const handleMouseDown = useCallback(
			(handle: LineHandleType, e: React.MouseEvent) => {
				e.stopPropagation();
				e.preventDefault();
				startResize(handle, e.clientX, e.clientY);
			},
			[startResize]
		);

		const handlePointerDown = useCallback(
			(handle: LineHandleType, e: React.PointerEvent) => {
				e.stopPropagation();
				e.preventDefault();
				try {
					(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
				} catch { }
				startResize(handle, e.clientX, e.clientY);
			},
			[startResize]
		);

		const currentStartX = previewState ? previewState.startX : element.startX;
		const currentStartY = previewState ? previewState.startY : element.startY;
		const currentEndX = previewState ? previewState.endX : element.endX;
		const currentEndY = previewState ? previewState.endY : element.endY;

		const currentEffectiveScale = (scale && scale > 0) ? scale : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);
		const handleScale = 1 / (currentEffectiveScale > 0 ? currentEffectiveScale : 1);

		// Line styling for live drag preview
		const lineStyle = (element instanceof Line && element.lineStyle) ? element.lineStyle : undefined;
		const stroke = lineStyle?.stroke ?? "#137cbd";
		const thickness = element.thickness ?? 2;
		const dashing = lineStyle?.dashing ?? [0, 0];
		const headStyle: [HeadStyle, HeadStyle] = lineStyle?.headStyle ?? ["none", "default"];

		let adjStartX = currentStartX;
		let adjStartY = currentStartY;
		let adjEndX = currentEndX;
		let adjEndY = currentEndY;

		const dx = currentEndX - currentStartX;
		const dy = currentEndY - currentStartY;
		const length = Math.hypot(dx, dy);

		const startMarkerLength = MARKER_LENGTHS[headStyle[0]] ?? 0;
		const endMarkerLength = MARKER_LENGTHS[headStyle[1]] ?? 0;
		const startOffset = thickness * startMarkerLength;
		const endOffset = thickness * endMarkerLength;

		if (length > (startOffset + endOffset)) {
			const angle = Math.atan2(dy, dx);
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			adjStartX = currentStartX + cos * startOffset;
			adjStartY = currentStartY + sin * startOffset;
			adjEndX = currentEndX - cos * endOffset;
			adjEndY = currentEndY - sin * endOffset;
		}

		return (
			<>
				{previewState && (
					<>
						{/* Fullscreen pointer tracking capture layer */}
						<div
							className="nopan"
							style={{
								position: "fixed",
								top: 0,
								left: 0,
								width: "100vw",
								height: "100vh",
								zIndex: 99999,
								cursor: "crosshair",
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
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
							}}
						/>

						{/* Live SVG drag preview */}
						<svg
							style={{
								position: "absolute",
								left: 0,
								top: 0,
								width: "100%",
								height: "100%",
								pointerEvents: "none",
								overflow: "visible",
								zIndex: 30004
							}}
						>
							<defs>
								<marker
									id="line-resize-preview-marker-default"
									refX={0}
									refY={1.5}
									markerWidth={3}
									markerHeight={3}
									orient="auto-start-reverse"
								>
									<path d="M 0 0 L 3 1.5 L 0 3 z" fill={stroke} />
								</marker>
								<marker
									id="line-resize-preview-marker-thin"
									refX={0}
									refY={1}
									markerWidth={4}
									markerHeight={2}
									orient="auto-start-reverse"
								>
									<path d="M 0 0 L 4 1 L 0 2 z" fill={stroke} />
								</marker>
							</defs>

							<path
								d={`M ${adjStartX} ${adjStartY} L ${adjEndX} ${adjEndY}`}
								stroke={stroke}
								strokeWidth={thickness}
								strokeLinecap="butt"
								strokeDasharray={dashing[0] > 0 ? `${dashing[0]} ${dashing[1]}` : undefined}
								markerStart={headStyle[0] !== "none" ? `url(#line-resize-preview-marker-${headStyle[0]})` : undefined}
								markerEnd={headStyle[1] !== "none" ? `url(#line-resize-preview-marker-${headStyle[1]})` : undefined}
								opacity={0.9}
							/>
						</svg>
					</>
				)}

				<div
					className={`nopan ${styles.resizeHandlesContainer}`}
					style={{ "--handle-scale": handleScale } as React.CSSProperties}
					onMouseUp={(e) => e.stopPropagation()}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Start Handle */}
					<div
						className={styles.handle}
						style={{ left: currentStartX, top: currentStartY, cursor: "crosshair" }}
						onMouseDown={(e) => handleMouseDown("start", e)}
						onPointerDown={(e) => handlePointerDown("start", e)}
						onMouseUp={(e) => e.stopPropagation()}
						onClick={(e) => e.stopPropagation()}
						title="Start Point"
					/>

					{/* End Handle */}
					<div
						className={styles.handle}
						style={{ left: currentEndX, top: currentEndY, cursor: "crosshair" }}
						onMouseDown={(e) => handleMouseDown("end", e)}
						onPointerDown={(e) => handlePointerDown("end", e)}
						onMouseUp={(e) => e.stopPropagation()}
						onClick={(e) => e.stopPropagation()}
						title="End Point"
					/>
				</div>
			</>
		);
	}
);

export default CanvasLineResizeHandles;
