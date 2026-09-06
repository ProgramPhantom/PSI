import React, { useState, useRef, useCallback, useEffect } from "react";
import ENGINE from "../../logic/engine";
import Line, { HeadStyle, ILine } from "../../logic/line";
import LineLike, { ILineLike } from "../../logic/lineLike";
import { IPlacementBindingRule, PlacementConfiguration, SiteNames } from "../../logic/spacial";
import Visual from "../../logic/visual";
import BindingsSelector, { ISelectedBindingInfo } from "../canvas/BindingsSelector";
import { isBindingAllowedForResizing } from "../canvas/bindingResizeConfig";
import { useAppDispatch } from "../../redux/hooks";
import { setIsResizing } from "../../redux/slices/applicationSlice";
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
	hoveredElement?: Visual;
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
	function CanvasLineResizeHandles({ element, scale = 1, onResize, hoveredElement }: CanvasLineResizeHandlesProps) {
		const dispatch = useAppDispatch();
		const [previewState, setPreviewState] = useState<LinePreviewState | null>(null);
		const [activeHandle, setActiveHandle] = useState<LineHandleType | null>(null);

		const elementRef = useRef(element);
		elementRef.current = element;

		const scaleRef = useRef(scale);
		scaleRef.current = scale;

		const onResizeRef = useRef(onResize);
		onResizeRef.current = onResize;

		const hoveredElementRef = useRef(hoveredElement);
		hoveredElementRef.current = hoveredElement;

		const [snappedAnchorKey, setSnappedAnchorKey] = useState<string | null>(null);
		const snappedBindingRef = useRef<ISelectedBindingInfo | null>(null);

		const isBindingAllowed = isBindingAllowedForResizing(element);

		const activeAnchor = (
			isBindingAllowed &&
			activeHandle !== null &&
			hoveredElement &&
			hoveredElement.id !== element.id &&
			hoveredElement.type !== "diagram" &&
			Boolean(hoveredElement.AnchorFunctions)
		) ? hoveredElement : null;

		const applyBinding = useCallback(
			(info: ISelectedBindingInfo, handle: LineHandleType) => {
				const currentElement = elementRef.current;
				const newRules: IPlacementBindingRule[] = [
					{
						targetId: info.anchorObject.id,
						dimension: "x",
						anchorSiteName: info.xAnchor,
						targetSiteName: handle,
						bindToContent: true
					},
					{
						targetId: info.anchorObject.id,
						dimension: "y",
						anchorSiteName: info.yAnchor,
						targetSiteName: handle,
						bindToContent: true
					}
				];

				const currentRules = (currentElement.placementMode?.type === "binds")
					? currentElement.placementMode.config
					: [];
				const remainingRules = currentRules.filter((r) => r.targetSiteName !== handle);
				for (const r of currentRules.filter((r) => r.targetSiteName === handle)) {
					const anchorId = r.targetId || r.anchorId;
					if (anchorId) {
						const anchor = ENGINE.handler.identifyElement(anchorId);
						anchor?.clearBindsTo(currentElement, r.dimension, handle);
					}
				}

				for (const r of newRules) {
					info.anchorObject.bind(
						currentElement,
						r.dimension,
						r.anchorSiteName,
						r.targetSiteName,
						r.offset,
						r.hint,
						r.bindToContent
					);
				}

				const updatedPlacementMode: PlacementConfiguration = {
					type: "binds",
					config: [...remainingRules, ...newRules]
				};

				const finalStartX = handle === "start" ? info.point.x : currentElement.startX;
				const finalStartY = handle === "start" ? info.point.y : currentElement.startY;
				const finalEndX = handle === "end" ? info.point.x : currentElement.endX;
				const finalEndY = handle === "end" ? info.point.y : currentElement.endY;

				const newLineState: ILineLike = {
					...currentElement.state,
					placementMode: updatedPlacementMode,
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
						target: currentElement,
						child: newLineState
					}
				});

				dispatch(setIsResizing(false));
				setActiveHandle(null);
				setPreviewState(null);
				setSnappedAnchorKey(null);
				snappedBindingRef.current = null;
				onResizeRef.current?.(null);
			},
			[dispatch]
		);

		const dragCleanupRef = useRef<(() => void) | null>(null);
		useEffect(() => {
			return () => {
				if (dragCleanupRef.current) {
					dragCleanupRef.current();
					dragCleanupRef.current = null;
				}
				dispatch(setIsResizing(false));
			};
		}, [dispatch]);

		const startResize = useCallback((handle: LineHandleType, clientX: number, clientY: number) => {
			const currentElement = elementRef.current;
			const rawScale = scaleRef.current;
			const effectiveScale = (rawScale && rawScale > 0) ? rawScale : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);

			dispatch(setIsResizing(true));
			setActiveHandle(handle);

			const isCtrlPressedRef = { current: false };
			const lastDeltaRef = { current: { deltaX: 0, deltaY: 0 } };

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

			const computeSnappedEndpoints = (deltaX: number, deltaY: number, isCtrl: boolean): LinePreviewState => {
				let rawStartX = initial.startX;
				let rawStartY = initial.startY;
				let rawEndX = initial.endX;
				let rawEndY = initial.endY;

				if (initial.handle === "start") {
					rawStartX = Math.round(initial.startX + deltaX);
					rawStartY = Math.round(initial.startY + deltaY);

					if (isCtrl) {
						const dx = rawStartX - initial.endX;
						const dy = rawStartY - initial.endY;
						if (Math.abs(dx) >= Math.abs(dy)) {
							// Horizontal: match Y of anchor (end point)
							return { startX: rawStartX, startY: initial.endY, endX: initial.endX, endY: initial.endY };
						} else {
							// Vertical: match X of anchor (end point)
							return { startX: initial.endX, startY: rawStartY, endX: initial.endX, endY: initial.endY };
						}
					}

					return { startX: rawStartX, startY: rawStartY, endX: initial.endX, endY: initial.endY };
				} else {
					rawEndX = Math.round(initial.endX + deltaX);
					rawEndY = Math.round(initial.endY + deltaY);

					if (isCtrl) {
						const dx = rawEndX - initial.startX;
						const dy = rawEndY - initial.startY;
						if (Math.abs(dx) >= Math.abs(dy)) {
							// Horizontal: match Y of anchor (start point)
							return { startX: initial.startX, startY: initial.startY, endX: rawEndX, endY: initial.startY };
						} else {
							// Vertical: match X of anchor (start point)
							return { startX: initial.startX, startY: initial.startY, endX: initial.startX, endY: rawEndY };
						}
					}

					return { startX: initial.startX, startY: initial.startY, endX: rawEndX, endY: rawEndY };
				}
			};

			const updatePreviewWithDelta = (deltaX: number, deltaY: number, isCtrl: boolean) => {
				lastDeltaRef.current = { deltaX, deltaY };
				const preview = computeSnappedEndpoints(deltaX, deltaY, isCtrl);
				setPreviewState(preview);
				onResizeRef.current?.(preview);
				return preview;
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
				const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
				const deltaPixelsX = e.clientX - initial.clientX;
				const deltaPixelsY = e.clientY - initial.clientY;

				const deltaDiagramX = deltaPixelsX / initial.effectiveScale;
				const deltaDiagramY = deltaPixelsY / initial.effectiveScale;

				if (isBindingAllowed) {
					const cand = hoveredElementRef.current;
					const foundAnchor = (
						cand &&
						cand.id !== initial.element.id &&
						cand.type !== "diagram" &&
						Boolean(cand.AnchorFunctions)
					) ? cand : null;

					let activeSnap: ISelectedBindingInfo | null = null;
					let activeKey: string | null = null;

					if (foundAnchor && foundAnchor.AnchorFunctions) {
						const rawPointX = initial.handle === "start" ? (initial.startX + deltaDiagramX) : (initial.endX + deltaDiagramX);
						const rawPointY = initial.handle === "start" ? (initial.startY + deltaDiagramY) : (initial.endY + deltaDiagramY);

						const AnchorLocations: SiteNames[] = ["here", "centre", "far"];
						let bestDist = Infinity;

						for (const xA of AnchorLocations) {
							for (const yA of AnchorLocations) {
								const sx = foundAnchor.AnchorFunctions[xA].get("x", true);
								const sy = foundAnchor.AnchorFunctions[yA].get("y", true);
								const dist = Math.hypot(rawPointX - sx, rawPointY - sy) * initial.effectiveScale;
								if (dist < bestDist) {
									bestDist = dist;
									if (dist <= 24) {
										activeSnap = {
											anchorObject: foundAnchor,
											xAnchor: xA,
											yAnchor: yA,
											point: { x: sx, y: sy }
										};
										activeKey = `${xA}-${yA}`;
									}
								}
							}
						}
					}

					snappedBindingRef.current = activeSnap;
					setSnappedAnchorKey(activeKey);

					if (activeSnap) {
						const snappedPreview: LinePreviewState = {
							startX: initial.handle === "start" ? activeSnap.point.x : initial.startX,
							startY: initial.handle === "start" ? activeSnap.point.y : initial.startY,
							endX: initial.handle === "end" ? activeSnap.point.x : initial.endX,
							endY: initial.handle === "end" ? activeSnap.point.y : initial.endY
						};
						setPreviewState(snappedPreview);
						onResizeRef.current?.(snappedPreview);
						return;
					}
				}

				updatePreviewWithDelta(deltaDiagramX, deltaDiagramY, isCtrl);
			};

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Control") {
					isCtrlPressedRef.current = true;
					updatePreviewWithDelta(lastDeltaRef.current.deltaX, lastDeltaRef.current.deltaY, true);
				}
			};

			const handleKeyUp = (e: KeyboardEvent) => {
				if (e.key === "Control") {
					isCtrlPressedRef.current = false;
					updatePreviewWithDelta(lastDeltaRef.current.deltaX, lastDeltaRef.current.deltaY, false);
				}
			};

			const handleBlur = () => {
				isCtrlPressedRef.current = false;
				updatePreviewWithDelta(lastDeltaRef.current.deltaX, lastDeltaRef.current.deltaY, false);
			};

			const handlePointerUp = (e: MouseEvent | PointerEvent) => {
				e.stopPropagation();
				e.stopImmediatePropagation();
				e.preventDefault();

				window.removeEventListener("mousemove", handlePointerMove, true);
				window.removeEventListener("mouseup", handlePointerUp, true);
				window.removeEventListener("pointermove", handlePointerMove, true);
				window.removeEventListener("pointerup", handlePointerUp, true);
				window.removeEventListener("keydown", handleKeyDown, true);
				window.removeEventListener("keyup", handleKeyUp, true);
				window.removeEventListener("blur", handleBlur, true);
				dragCleanupRef.current = null;
				dispatch(setIsResizing(false));

				const snapped = snappedBindingRef.current;
				snappedBindingRef.current = null;
				setSnappedAnchorKey(null);

				if (snapped) {
					applyBinding(snapped, initial.handle);
					return;
				}

				setActiveHandle(null);
				setPreviewState(null);
				onResizeRef.current?.(null);

				const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
				const deltaPixelsX = e.clientX - initial.clientX;
				const deltaPixelsY = e.clientY - initial.clientY;

				const deltaDiagramX = deltaPixelsX / initial.effectiveScale;
				const deltaDiagramY = deltaPixelsY / initial.effectiveScale;

				const finalResult = computeSnappedEndpoints(deltaDiagramX, deltaDiagramY, isCtrl);

				const hasMoved = finalResult.startX !== initial.startX || finalResult.startY !== initial.startY ||
					finalResult.endX !== initial.endX || finalResult.endY !== initial.endY;

				if (hasMoved) {
					let updatedPlacementMode = initial.element.placementMode;
					if (updatedPlacementMode?.type === "binds") {
						const handle = initial.handle;

						const currentRules = updatedPlacementMode.config;
						const rulesToRemove = currentRules.filter((r) => r.targetSiteName === handle);
						for (const r of rulesToRemove) {
							const anchorId = r.targetId || r.anchorId;
							if (anchorId) {
								const anchor = ENGINE.handler.identifyElement(anchorId);
								anchor?.clearBindsTo(initial.element, r.dimension, handle);
							}
						}
						const remainingRules = currentRules.filter((r) => r.targetSiteName !== handle);
						if (remainingRules.length > 0) {
							updatedPlacementMode = { type: "binds", config: remainingRules };
						} else {
							updatedPlacementMode = { type: "free" };
						}

					}

					const newLineState: ILineLike = {
						...initial.element.state,
						placementMode: updatedPlacementMode,
						startX: finalResult.startX,
						startY: finalResult.startY,
						endX: finalResult.endX,
						endY: finalResult.endY,
						x: Math.min(finalResult.startX, finalResult.endX),
						y: Math.min(finalResult.startY, finalResult.endY)
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
			window.addEventListener("keydown", handleKeyDown, true);
			window.addEventListener("keyup", handleKeyUp, true);
			window.addEventListener("blur", handleBlur, true);

			dragCleanupRef.current = () => {
				window.removeEventListener("mousemove", handlePointerMove, true);
				window.removeEventListener("mouseup", handlePointerUp, true);
				window.removeEventListener("pointermove", handlePointerMove, true);
				window.removeEventListener("pointerup", handlePointerUp, true);
				window.removeEventListener("keydown", handleKeyDown, true);
				window.removeEventListener("keyup", handleKeyUp, true);
				window.removeEventListener("blur", handleBlur, true);
				dispatch(setIsResizing(false));
				setActiveHandle(null);
				setPreviewState(null);
				setSnappedAnchorKey(null);
				snappedBindingRef.current = null;
				onResizeRef.current?.(null);
			};
		}, [applyBinding, dispatch, isBindingAllowed]);

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
				startResize(handle, e.clientX, e.clientY);
			},
			[startResize]
		);

		const currentStartX = previewState ? previewState.startX : element.startX;
		const currentStartY = previewState ? previewState.startY : element.startY;
		const currentEndX = previewState ? previewState.endX : element.endX;
		const currentEndY = previewState ? previewState.endY : element.endY;

		const isHandleBound = useCallback(
			(handle: LineHandleType): boolean => {
				if (element.placementMode?.type === "binds") {
					if (element.placementMode.config.some((r) => r.targetSiteName === handle)) {
						return true;
					}
				}
				if (element.bindingsToThis && element.bindingsToThis.some((b) => b.bindingRule.targetSiteName === handle)) {
					return true;
				}
				return false;
			},
			[element]
		);

		const isStartBound = isHandleBound("start");
		const isEndBound = isHandleBound("end");

		const showStartBound = isStartBound && activeHandle !== "start";
		const showEndBound = isEndBound && activeHandle !== "end";

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
						className={`${styles.handle} ${showStartBound ? styles.boundHandle : ""}`}
						style={{ left: currentStartX, top: currentStartY, cursor: "crosshair" }}
						onMouseDown={(e) => handleMouseDown("start", e)}
						onPointerDown={(e) => handlePointerDown("start", e)}
						onMouseUp={(e) => e.stopPropagation()}
						onClick={(e) => e.stopPropagation()}
						title={isStartBound ? "Start Point (Bound - Drag to unbind)" : "Start Point"}
					>
						{showStartBound && (
							<svg
								className={styles.boundIcon}
								viewBox="0 0 8 8"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M 1.5 1.5 L 6.5 6.5 M 6.5 1.5 L 1.5 6.5"
									stroke="grey"
									strokeWidth="1.5"
									strokeLinecap="round"
								/>
							</svg>
						)}
					</div>

					{/* End Handle */}
					<div
						className={`${styles.handle} ${showEndBound ? styles.boundHandle : ""}`}
						style={{ left: currentEndX, top: currentEndY, cursor: "crosshair" }}
						onMouseDown={(e) => handleMouseDown("end", e)}
						onPointerDown={(e) => handlePointerDown("end", e)}
						onMouseUp={(e) => e.stopPropagation()}
						onClick={(e) => e.stopPropagation()}
						title={isEndBound ? "End Point (Bound - Drag to unbind)" : "End Point"}
					>
						{showEndBound && (
							<svg
								className={styles.boundIcon}
								viewBox="0 0 8 8"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M 1.5 1.5 L 6.5 6.5 M 6.5 1.5 L 1.5 6.5"
									stroke="grey"
									strokeWidth="1.5"
									strokeLinecap="round"
								/>
							</svg>
						)}
					</div>
				</div>

				{/* Bindings Selector for hovered anchor element when resizing */}
				{isBindingAllowed && activeHandle !== null && activeAnchor && (
					<BindingsSelector
						element={activeAnchor}
						onSelectBind={(info) => applyBinding(info, activeHandle)}
						activeAnchorKey={snappedAnchorKey}
					/>
				)}
			</>
		);
	}
);

export default CanvasLineResizeHandles;
