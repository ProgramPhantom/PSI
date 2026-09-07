import React, { useState, useRef, useCallback, useEffect } from "react";
import ENGINE from "../../logic/engine";
import {
	IPlacementBindingRule,
	PlacementConfiguration,
	ISequenceBindingRule,
	SizeConfiguration,
} from "../../logic/spacial";
import Spacial from "../../logic/spacial";
import Visual, { IVisual } from "../../logic/visual";
import styles from "./styles/CanvasResizeHandles.module.scss";
import { useAppDispatch } from "../../redux/hooks";
import { setIsResizing } from "../../redux/slices/applicationSlice";
import BindingsSelector, { ISelectedBindingInfo } from "../canvas/BindingsSelector";
import {
	findClosestBindingAnchor,
	isBindingAllowedForResizing,
	isBindingAllowedAsTarget
} from "../canvas/bindingUtil";
import { applyBindingRule, clearBindingRuleFromAnchor, createPlacementBindingRule, determineBindingPlacementModeType, filterPlacementBindingRules, updatePlacementModeBindingRules } from "../../logic/bindingUtil";

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
	hoveredElement?: Spacial;
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
	minDrawWidth: number;
	minDrawHeight: number;
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

interface HandleBindingSites {
	xSite?: "here" | "far";
	ySite?: "here" | "far";
}

const HANDLE_SITE_MAP: Record<HandleDirection, HandleBindingSites> = {
	nw: { xSite: "here", ySite: "here" },
	n: { ySite: "here" },
	ne: { xSite: "far", ySite: "here" },
	e: { xSite: "far" },
	se: { xSite: "far", ySite: "far" },
	s: { ySite: "far" },
	sw: { xSite: "here", ySite: "far" },
	w: { xSite: "here" }
};

function computeHandleCoordinates(
	direction: HandleDirection,
	left: number,
	top: number,
	width: number,
	height: number,
	deltaDiagramX: number,
	deltaDiagramY: number
): { x: number; y: number } {
	switch (direction) {
		case "nw":
			return { x: left + deltaDiagramX, y: top + deltaDiagramY };
		case "n":
			return { x: left + width / 2, y: top + deltaDiagramY };
		case "ne":
			return { x: left + width + deltaDiagramX, y: top + deltaDiagramY };
		case "e":
			return { x: left + width + deltaDiagramX, y: top + height / 2 };
		case "se":
			return { x: left + width + deltaDiagramX, y: top + height + deltaDiagramY };
		case "s":
			return { x: left + width / 2, y: top + height + deltaDiagramY };
		case "sw":
			return { x: left + deltaDiagramX, y: top + height + deltaDiagramY };
		case "w":
			return { x: left + deltaDiagramX, y: top + height / 2 };
	}
}

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
	isFree: boolean,
	minWidth: number = MIN_SIZE,
	minHeight: number = MIN_SIZE
): ResizeResult {
	let targetWidth = startWidth;
	let targetHeight = startHeight;
	let newElemX = startX;
	let newElemY = startY;
	let newDrawCX = startDrawCX;
	let newDrawCY = startDrawCY;

	const effectiveMinWidth = Math.max(MIN_SIZE, minWidth);
	const effectiveMinHeight = Math.max(MIN_SIZE, minHeight);

	// Width / X calculations
	if (direction === "e" || direction === "ne" || direction === "se") {
		targetWidth = Math.max(effectiveMinWidth, Math.round(startWidth + deltaX));
	} else if (direction === "w" || direction === "nw" || direction === "sw") {
		targetWidth = Math.max(effectiveMinWidth, Math.round(startWidth - deltaX));
		const actualDeltaX = startWidth - targetWidth;
		if (isFree) {
			newElemX = Math.round(startX + actualDeltaX);
		}
		newDrawCX = Math.round(startDrawCX + actualDeltaX);
	}

	// Height / Y calculations
	if (direction === "s" || direction === "se" || direction === "sw") {
		targetHeight = Math.max(effectiveMinHeight, Math.round(startHeight + deltaY));
	} else if (direction === "n" || direction === "ne" || direction === "nw") {
		targetHeight = Math.max(effectiveMinHeight, Math.round(startHeight - deltaY));
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
	function CanvasResizeHandles({ element, scale = 1, onResize, hoveredElement }: CanvasResizeHandlesProps) {
		const dispatch = useAppDispatch();
		const [previewState, setPreviewState] = useState<PreviewState | null>(null);
		const [activeDirection, setActiveDirection] = useState<HandleDirection | null>(null);

		// Keep refs to latest element, scale, and onResize so drag listeners always have the freshest values
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
			activeDirection !== null &&
			isBindingAllowedAsTarget(hoveredElement, element.id)
		) ? hoveredElement : null;

		const applyBinding = useCallback(
			(info: ISelectedBindingInfo, direction: HandleDirection) => {
				const currentElement = elementRef.current;
				if (!isBindingAllowedAsTarget(info.anchorObject, currentElement.id)) {
					return;
				}
				const sites = HANDLE_SITE_MAP[direction];
				const currentRules = (currentElement.placementMode?.type === "binds" || currentElement.placementMode?.type === "sequenceBind")
					? (currentElement.placementMode.config)
					: [];

				// Remove existing rules matching the sites affected by this handle
				let remainingRules = currentRules;
				const removedRules: (IPlacementBindingRule | ISequenceBindingRule)[] = [];

				if (sites.xSite) {
					const res = filterPlacementBindingRules(remainingRules, sites.xSite, "x");
					remainingRules = res.remaining;
					removedRules.push(...res.removed);
				}
				if (sites.ySite) {
					const res = filterPlacementBindingRules(remainingRules, sites.ySite, "y");
					remainingRules = res.remaining;
					removedRules.push(...res.removed);
				}

				for (const r of removedRules) {
					clearBindingRuleFromAnchor(r, currentElement);
				}

				const newRules: (IPlacementBindingRule | ISequenceBindingRule)[] = [];
				if (sites.xSite) {
					newRules.push(createPlacementBindingRule(info, "x", sites.xSite));
				}
				if (sites.ySite) {
					newRules.push(createPlacementBindingRule(info, "y", sites.ySite));
				}

				for (const r of newRules) {
					applyBindingRule(r, currentElement, info.anchorObject);
				}

				const updatedPlacementMode: PlacementConfiguration = determineBindingPlacementModeType([...remainingRules, ...newRules]);

				const padLeft = currentElement.padding?.[3] ?? 0;
				const padRight = currentElement.padding?.[1] ?? 0;
				const padTop = currentElement.padding?.[0] ?? 0;
				const padBottom = currentElement.padding?.[2] ?? 0;

				let finalDrawCX = currentElement.drawCX;
				let finalDrawCY = currentElement.drawCY;
				let finalContentWidth = currentElement.contentWidth;
				let finalContentHeight = currentElement.contentHeight;

				if (sites.xSite === "far") {
					finalContentWidth = Math.max(MIN_SIZE, Math.round(info.point.x - finalDrawCX - padRight - padLeft));
				} else if (sites.xSite === "here") {
					const oldRight = finalDrawCX + currentElement.width;
					finalDrawCX = Math.round(info.point.x);
					finalContentWidth = Math.max(MIN_SIZE, Math.round(oldRight - info.point.x - padRight - padLeft));
				}

				if (sites.ySite === "far") {
					finalContentHeight = Math.max(MIN_SIZE, Math.round(info.point.y - finalDrawCY - padTop - padBottom));
				} else if (sites.ySite === "here") {
					const oldBottom = finalDrawCY + currentElement.height;
					finalDrawCY = Math.round(info.point.y);
					finalContentHeight = Math.max(MIN_SIZE, Math.round(oldBottom - info.point.y - padTop - padBottom));
				}

				const targetX = finalDrawCX - padLeft;
				const targetY = finalDrawCY - padTop;

				const newState: IVisual = {
					...currentElement.state,
					placementMode: updatedPlacementMode,
					contentWidth: finalContentWidth,
					contentHeight: finalContentHeight,
					sizeMode: {
						x: "fixed",
						y: "fixed"
					}
				};

				if (currentElement.placementMode?.type === "free" || currentElement.placementMode?.type === "binds") {
					newState.x = targetX;
					newState.y = targetY;
				}

				ENGINE.handler.act({
					type: "modify",
					input: {
						target: currentElement,
						child: newState
					}
				});

				dispatch(setIsResizing(false));
				setActiveDirection(null);
				setPreviewState(null);
				setSnappedAnchorKey(null);
				snappedBindingRef.current = null;
				onResizeRef.current?.(null);
			},
			[dispatch]
		);

		// Clean up any ongoing drag on unmount
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

		const startResize = useCallback((direction: HandleDirection, clientX: number, clientY: number) => {
			dispatch(setIsResizing(true));
			const currentElement = elementRef.current;
			const isFree = currentElement.placementMode.type === "free";
			const rawScale = scaleRef.current;
			const effectiveScale = (rawScale && rawScale > 0) ? rawScale : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);

			setActiveDirection(direction);

			const initial: DragInitialState = {
				direction,
				startX: clientX,
				startY: clientY,
				startContentWidth: currentElement.drawContentWidth ?? currentElement.contentWidth ?? 0,
				startContentHeight: currentElement.drawContentHeight ?? currentElement.contentHeight ?? 0,
				startElemX: currentElement.x ?? 0,
				startElemY: currentElement.y ?? 0,
				startDrawCX: currentElement.drawCX ?? 0,
				startDrawCY: currentElement.drawCY ?? 0,
				minDrawWidth: currentElement.minDrawContentWidth ?? currentElement.minContentWidth ?? MIN_SIZE,
				minDrawHeight: currentElement.minDrawContentHeight ?? currentElement.minContentHeight ?? MIN_SIZE,
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

				if (isBindingAllowed) {
					const handlePos = computeHandleCoordinates(
						initial.direction,
						initial.startDrawCX,
						initial.startDrawCY,
						initial.startContentWidth,
						initial.startContentHeight,
						deltaDiagramX,
						deltaDiagramY
					);

					const snap = findClosestBindingAnchor(
						hoveredElementRef.current,
						initial.element.id,
						handlePos,
						initial.effectiveScale
					);

					snappedBindingRef.current = snap?.bindingInfo ?? null;
					setSnappedAnchorKey(snap?.key ?? null);

					if (snap) {
						const sites = HANDLE_SITE_MAP[initial.direction];
						let snappedDrawCX = initial.startDrawCX;
						let snappedDrawCY = initial.startDrawCY;
						let snappedWidth = initial.startContentWidth;
						let snappedHeight = initial.startContentHeight;

						if (sites.xSite === "far") {
							snappedWidth = Math.max(initial.minDrawWidth, Math.round(snap.bindingInfo.point.x - snappedDrawCX));
						} else if (sites.xSite === "here") {
							const oldRight = initial.startDrawCX + initial.startContentWidth;
							snappedWidth = Math.max(initial.minDrawWidth, Math.round(oldRight - snap.bindingInfo.point.x));
							snappedDrawCX = Math.round(oldRight - snappedWidth);
						}

						if (sites.ySite === "far") {
							snappedHeight = Math.max(initial.minDrawHeight, Math.round(snap.bindingInfo.point.y - snappedDrawCY));
						} else if (sites.ySite === "here") {
							const oldBottom = initial.startDrawCY + initial.startContentHeight;
							snappedHeight = Math.max(initial.minDrawHeight, Math.round(oldBottom - snap.bindingInfo.point.y));
							snappedDrawCY = Math.round(oldBottom - snappedHeight);
						}

						const snappedPreview: PreviewState = {
							left: snappedDrawCX,
							top: snappedDrawCY,
							width: snappedWidth,
							height: snappedHeight
						};

						setPreviewState(snappedPreview);
						onResizeRef.current?.(snappedPreview);
						return;
					}
				}

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
					initial.isFree,
					initial.minDrawWidth,
					initial.minDrawHeight
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
				dispatch(setIsResizing(false));

				const snapped = snappedBindingRef.current;
				snappedBindingRef.current = null;
				setSnappedAnchorKey(null);

				if (snapped) {
					applyBinding(snapped, initial.direction);
					return;
				}

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
					initial.isFree,
					initial.minDrawWidth,
					initial.minDrawHeight
				);

				const sites = HANDLE_SITE_MAP[initial.direction];
				let updatedPlacementMode = initial.element.placementMode;
				const removedRules: (IPlacementBindingRule | ISequenceBindingRule)[] = [];

				if (sites.xSite) {
					const res = updatePlacementModeBindingRules(updatedPlacementMode, sites.xSite, "x");
					updatedPlacementMode = res.updatedPlacementMode;
					removedRules.push(...res.removedRules);
				}
				if (sites.ySite) {
					const res = updatePlacementModeBindingRules(updatedPlacementMode, sites.ySite, "y");
					updatedPlacementMode = res.updatedPlacementMode;
					removedRules.push(...res.removedRules);
				}

				for (const r of removedRules) {
					clearBindingRuleFromAnchor(r, initial.element);
				}

				const widthChanged = finalResult.width !== initial.startContentWidth;
				const heightChanged = finalResult.height !== initial.startContentHeight;
				const xChanged = finalResult.drawCX !== initial.startDrawCX;
				const yChanged = finalResult.drawCY !== initial.startDrawCY;
				const unbindingNeeded = removedRules.length > 0;

				if (widthChanged || heightChanged || xChanged || yChanged || unbindingNeeded) {
					const newSizeMode: SizeConfiguration = {
						x: widthChanged ? "fixed" : (initial.element.state.sizeMode?.x ?? "fixed"),
						y: heightChanged ? "fixed" : (initial.element.state.sizeMode?.y ?? "fixed")
					};

					const extraWidth = Math.max(0, (initial.element.drawContentWidth ?? 0) - (initial.element.contentWidth ?? 0));
					const extraHeight = Math.max(0, (initial.element.drawContentHeight ?? 0) - (initial.element.contentHeight ?? 0));

					const padLeft = initial.element.padding?.[3] ?? 0;
					const padTop = initial.element.padding?.[0] ?? 0;

					const targetContentWidth = Math.max(0, finalResult.width - extraWidth);
					const targetContentHeight = Math.max(0, finalResult.height - extraHeight);
					const targetX = finalResult.drawCX - padLeft;
					const targetY = finalResult.drawCY - padTop;

					const newState: IVisual = {
						...initial.element.state,
						placementMode: updatedPlacementMode,
						contentWidth: targetContentWidth,
						contentHeight: targetContentHeight,
						sizeMode: newSizeMode
					};

					if (updatedPlacementMode.type === "free" || updatedPlacementMode.type === "binds") {
						newState.x = targetX;
						newState.y = targetY;
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
				dispatch(setIsResizing(false));
				setActiveDirection(null);
				setPreviewState(null);
				setSnappedAnchorKey(null);
				snappedBindingRef.current = null;
				onResizeRef.current?.(null);
			};
		}, [dispatch]);

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
				} catch { }
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

		const isHandleBound = (dir: HandleDirection): boolean => {
			if (element.placementMode?.type !== "binds") return false;
			const sites = HANDLE_SITE_MAP[dir];
			const rules = element.placementMode.config;
			return rules.some((r) =>
				(sites.xSite && r.dimension === "x" && r.targetSiteName === sites.xSite) ||
				(sites.ySite && r.dimension === "y" && r.targetSiteName === sites.ySite)
			);
		};

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

					{element.isResizable && HANDLE_DIRECTIONS.map((dir) => {
						const pos = getHandlePosition(dir);
						const isBound = isHandleBound(dir);
						const showBound = isBound && !previewState;
						return (
							<div
								key={dir}
								className={`${styles.handle} ${DIRECTION_CLASS_MAP[dir]} ${showBound ? styles.boundHandle : ""}`}
								style={{ left: pos.left, top: pos.top }}
								onMouseDown={(e) => handleMouseDown(dir, e)}
								onPointerDown={(e) => handlePointerDown(dir, e)}
								onMouseUp={(e) => e.stopPropagation()}
								onClick={(e) => e.stopPropagation()}
								title={isBound ? `${dir.toUpperCase()} (Bound - Drag to unbind)` : dir.toUpperCase()}
							>
								{showBound && (
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
						);
					})}
				</div>

				{/* Bindings Selector for hovered anchor element when resizing */}
				{isBindingAllowed && activeDirection !== null && activeAnchor && (
					<BindingsSelector
						element={activeAnchor}
						onSelectBind={(info) => applyBinding(info, activeDirection)}
						activeAnchorKey={snappedAnchorKey}
					/>
				)}
			</>
		);
	}
);

export default CanvasResizeHandles;
