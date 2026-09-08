import { Button, Colors, Icon, Tooltip } from "@blueprintjs/core";
import "@svgdotjs/svg.draggable.js";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import Collection, { ClearIDs } from "../../logic/collection";
import ENGINE from "../../logic/engine";
import LabelGroup from "../../logic/hasComponents/labelGroup";
import LineLike, { ILineLike, isLineLike } from "../../logic/lineLike";
import Point from "../../logic/point";
import Spacial, { isPulse } from "../../logic/spacial";
import Visual, { IVisual } from "../../logic/visual";
import { AllDropResultTypes, DragElementTypes } from "./CanvasDropContainer";
import { CanvasLineResizeHandles, LinePreviewState } from "./CanvasLineResizeHandles";
import { CanvasResizeHandles, PreviewState } from "./CanvasResizeHandles";
import { SnapStore } from "../../logic/snapping";
import { useAppDispatch } from "../../redux/hooks";
import { handleGroupSelectedElements, handleUngroupElement } from "../../redux/thunks/actionThunks";




export const OFFSET_INDICATOR_THRESHOLD = 3;

const FLOATING_ACTION_CONTAINER_STYLE: React.CSSProperties = {
	position: "absolute",
	transform: "translate(6px, -12px)",
	zIndex: 31000,
	pointerEvents: "auto"
};

const FLOATING_ACTION_BUTTON_STYLE: React.CSSProperties = {
	boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
	fontSize: "11px",
	fontWeight: 600,
	height: "22px",
	padding: "0 8px"
};

interface IDraggableElementProps {
	name: string;
	element: Visual;
	x: number;
	y: number;

	reselect: (e: Visual, event?: React.MouseEvent) => void;
	visualState: "hovered" | "selected";
	selectedElements?: Visual[];
	isHidden?: boolean;
	isSpacePressed?: boolean;
	offsetIndicatorThreshold?: number;
	scale?: number;
	hoveredElement?: Spacial;
}

export interface CanvasDraggableElementPayload {
	element: Visual;
	offset?: { x: number, y: number };
	allElements?: Visual[];
}

/* When an element on the canvas is selected, it is replaced by this, a draggable element */
const CanvasDraggableElement: React.FC<IDraggableElementProps> = memo(
	function CanvasDraggableElement(props: IDraggableElementProps) {
		const dispatch = useAppDispatch();
		const offsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
		const mouseDownPosRef = useRef<{ x: number, y: number } | null>(null);
		const [livePreview, setLivePreview] = useState<PreviewState | null>(null);
		const [lineLivePreview, setLineLivePreview] = useState<LinePreviewState | null>(null);

		const isMultiSelected = Boolean(
			props.selectedElements &&
			props.selectedElements.length > 1 &&
			props.selectedElements.some((el) => el.id === props.element.id)
		);

		const isFirstSelectedElement = Boolean(
			props.selectedElements &&
			props.selectedElements.length > 1 &&
			props.selectedElements[0]?.id === props.element.id
		);

		const unionBoundingBox = useMemo(() => {
			if (!props.selectedElements || props.selectedElements.length <= 1) {
				return null;
			}
			return Spacial.CreateUnion(...props.selectedElements);
		}, [props.selectedElements]);

		const isInsideGroup = useMemo(() => {
			if (!props.element.parentId || props.element.parentId === ENGINE.handler?.diagram?.id) {
				return false;
			}
			const parent = ENGINE.handler.identifyElement(props.element.parentId);
			return Boolean(parent && parent.type === "collection" && parent instanceof Collection);
		}, [props.element.parentId]);

		const canGroup = useMemo(() => {
			if (!props.selectedElements || props.selectedElements.length < 2) {
				return false;
			}
			const diagramId = ENGINE.handler?.diagram?.id ?? "";
			const firstParentId = props.selectedElements[0].parentId || diagramId;
			return props.selectedElements.every((el) => (el.parentId || diagramId) === firstParentId);
		}, [props.selectedElements]);

		const origContentWidth = props.element.drawContentWidth > 0 ? props.element.drawContentWidth : 1;
		const origContentHeight = props.element.drawContentHeight > 0 ? props.element.drawContentHeight : 1;
		const visualX = livePreview ? livePreview.left : props.element.drawCX;
		const visualY = livePreview ? livePreview.top : props.element.drawCY;
		const visualWidth = livePreview ? livePreview.width : props.element.drawContentWidth;
		const visualHeight = livePreview ? livePreview.height : props.element.drawContentHeight;
		const visualScaleX = livePreview ? livePreview.width / origContentWidth : 1;
		const visualScaleY = livePreview ? livePreview.height / origContentHeight : 1;

		const threshold = props.offsetIndicatorThreshold ?? OFFSET_INDICATOR_THRESHOLD;
		const isFree = props.element.placementMode.type === "free";
		const [ox, oy] = props.element.offset ?? [0, 0];
		const offsetDistance = Math.hypot(ox, oy);
		const showOffsetIndicator = !isFree && offsetDistance >= threshold;

		const drawnCenterX = props.element.drawCX + props.element.drawContentWidth / 2;
		const drawnCenterY = props.element.drawCY + props.element.drawContentHeight / 2;
		const layoutCenterX = drawnCenterX - ox;
		const layoutCenterY = drawnCenterY - oy;

		// Compute drag element type:
		let dragElementType = DragElementTypes.OTHER;
		if (isPulse(props.element)) {
			dragElementType = DragElementTypes.PULSE;
		} else if (props.element.placementControl === "auto") {
			dragElementType = DragElementTypes.FIXED;
		} else {
			dragElementType = DragElementTypes.FREE;
		}

		const [{ isDragging }, drag, preview] = useDrag(
			() => ({
				type: dragElementType,
				canDrag: () => props.element.placementControl !== "auto",
				item: () => {
					const allElements = isMultiSelected
						? (props.selectedElements ?? [props.element])
						: [props.element];
					return {
						element: props.element,
						offset: offsetRef.current,
						allElements: allElements
					} as CanvasDraggableElementPayload;
				},
				end: (item, monitor) => {
					SnapStore.clear();
					const dropResult = monitor.getDropResult<AllDropResultTypes>();
					if (dropResult === null) {
						return;
					}

					const newState: IVisual = { ...item.element.state }

					switch (dropResult.type) {
						case "canvas": {
							const scale = ENGINE.surface.node.getScreenCTM()?.a ?? 1;

							const offsetX = item.offset?.x ?? 0;
							const offsetY = item.offset?.y ?? 0;

							const targetX = dropResult.data.x - (offsetX / scale);
							const targetY = dropResult.data.y - (offsetY / scale);

							const deltaX = targetX - item.element.x;
							const deltaY = targetY - item.element.y;

							const allElementsToMove = (item.allElements && item.allElements.length > 0)
								? item.allElements
								: [item.element];

							if (allElementsToMove.length === 1) {
								const targetEl = allElementsToMove[0];
								const targetState = targetEl.getShiftedState(deltaX, deltaY);

								targetState.parentId = targetEl.parentId || ENGINE.handler.diagram.id;
								targetState.placementMode = {
									type: "free",
								};

								ENGINE.handler.act({
									type: "modify",
									input: {
										child: targetState,
										target: targetEl
									}
								});
							} else {
								// Multi-element batch move
								const batchItems = allElementsToMove.map((targetEl) => {
									const targetState = targetEl.getShiftedState(deltaX, deltaY);

									targetState.parentId = targetEl.parentId || ENGINE.handler.diagram.id;
									targetState.placementMode = {
										type: "free",
									};

									return {
										type: "modify" as const,
										input: {
											child: targetState,
											target: targetEl
										}
									};
								});

								ENGINE.handler.act({
									type: "batch",
									input: batchItems
								});
							}
							break;
						}
						case "pulse": {
							const orientation = newState.pulseLayoutConfig?.orientation !== "both" ? dropResult.data.orientation : "both";
							let yAlign: "here" | "centre" | "far" = orientation === "bottom" ? "here" : orientation === "both" ? "centre" : "far";
							if (newState.type === "label" || newState.type === "text" || newState.type === "latex") {
								yAlign = "centre";
							}
							newState.pulseLayoutConfig = {
								channelID: dropResult.data.channelID,
								sequenceID: dropResult.data.sequenceID,
								index: dropResult.data.index,

								orientation: orientation,
								alignment: {
									x: newState.pulseLayoutConfig?.alignment?.x ?? "centre",
									y: yAlign
								},
								noSections: newState.pulseLayoutConfig?.noSections ?? 1,
								clipBar: newState.pulseLayoutConfig?.clipBar ?? false
							}

							newState.parentId = dropResult.data.channelID;

							newState.placementMode = {
								type: "grid",
								config: {}
							}

							newState.flipped = {
								x: false,
								y: newState.pulseLayoutConfig?.orientation === "bottom"
							};

							if (dropResult.data.insert === true) {
								ENGINE.handler.act({
									type: "insertColumn",
									input: {
										sequenceId: dropResult.data.sequenceID ?? "",
										index: dropResult.data.index
									}
								});
							}

							ENGINE.handler.act({
								type: "modify",
								input: {
									child: newState,
									target: props.element
								}
							})
						}
							break
						case "grid":
							newState.placementMode = {
								type: "grid",
								config: {
									coords: dropResult.data.coords
								}
							}
							newState.parentId = dropResult.data.id;

							break;
						case "labelGroup": {
							const pulseElement = ENGINE.handler.identifyElement(dropResult.data.pulseId);
							if (pulseElement) {
								const textElementState = structuredClone(props.element.state);
								ClearIDs(textElementState);
								textElementState.role = dropResult.data.role;

								let targetElement: Visual = pulseElement;
								const parentElement = pulseElement.parentId ? ENGINE.handler.identifyElement(pulseElement.parentId) : undefined;
								if (parentElement && LabelGroup.isLabelGroup(parentElement)) {
									targetElement = parentElement;
								}

								const labelGroupState = LabelGroup.applyAnnotation(targetElement.state, textElementState);

								// 1. Remove the text element from the diagram
								ENGINE.handler.act({
									type: "remove",
									input: {
										child: props.element
									}
								});

								// 2. Modify the target (pulse or label group)
								ENGINE.handler.act({
									type: "modify",
									input: {
										target: targetElement,
										child: labelGroupState
									}
								});
							}
							break;
						}
					}
				},
				collect: (monitor) => ({
					isDragging: monitor.isDragging(),
					handlerId: monitor.getHandlerId()
				})
			}),
			[props.x, props.y, props.name, props.element, props.selectedElements, isMultiSelected]
		);

		const { isAnyDragging, draggedItem } = useDragLayer((monitor) => ({
			isAnyDragging: monitor.isDragging(),
			draggedItem: monitor.getItem() as CanvasDraggableElementPayload | null
		}));

		const isDraggingThisOrPeer = isDragging || Boolean(
			isAnyDragging &&
			draggedItem?.allElements &&
			draggedItem.allElements.some((el) => el.id === props.element.id)
		);

		const visualRef = useRef<SVGSVGElement | null>(null);
		const isInteracting = isDraggingThisOrPeer || livePreview !== null || lineLivePreview !== null;

		// Removed the default preview?
		useEffect(() => {
			preview(getEmptyImage(), { captureDraggingState: true });
		}, [preview]);

		useEffect(() => {
			if (isInteracting) {
				const elementsToHide = (isDraggingThisOrPeer && isMultiSelected && props.selectedElements)
					? props.selectedElements
					: [props.element];

				elementsToHide.forEach((el) => el.svg?.hide());
				if (visualRef.current) {
					const visual = props.element.getInternalRepresentation()?.show();
					if (visual) {
						visualRef.current.replaceChildren(visual.node);
					}
				}
				return () => {
					elementsToHide.forEach((el) => el.svg?.show());
					visualRef.current?.replaceChildren();
				};
			}
		}, [isInteracting, isDraggingThisOrPeer, isMultiSelected, props.element, props.selectedElements]);



		return (
			<>
				<div key={dragElementType}
					className="nopan"
					style={{
						zIndex: 30000,
						opacity: (isDraggingThisOrPeer || props.isHidden) ? 0 : 1,
						position: "absolute",
						left: props.element.drawX,
						top: props.element.drawY,
						width: props.element.drawWidth,
						height: props.element.drawHeight,
						pointerEvents: (props.isHidden || props.isSpacePressed) ? "none" : "auto"
					}}>
					<div
						ref={props.element.placementControl === "auto" ? undefined : drag}
						onMouseDown={(e) => {
							if (e.button !== 0 || props.isSpacePressed) return;

							const isCtrl = e.ctrlKey || e.metaKey;
							mouseDownPosRef.current = { x: e.clientX, y: e.clientY };

							if (isCtrl) {
								props.reselect(props.element, e);
							} else {
								// If the element is not already selected, select it immediately so drag works.
								// If it is already selected (e.g. part of a multi-selection), don't deselect others yet,
								// so the user can drag the entire multi-selection together!
								if (!props.selectedElements?.some((el) => el.id === props.element.id)) {
									props.reselect(props.element, e);
								}
							}

							const rect = e.currentTarget.getBoundingClientRect();
							offsetRef.current = {
								x: e.clientX - rect.left,
								y: e.clientY - rect.top
							};
						}}
						onClick={(e) => {
							e.stopPropagation();
							if (props.isSpacePressed) return;

							if (mouseDownPosRef.current) {
								const dx = e.clientX - mouseDownPosRef.current.x;
								const dy = e.clientY - mouseDownPosRef.current.y;
								mouseDownPosRef.current = null;
								if (Math.hypot(dx, dy) > 5) {
									return;
								}
							}

							if (!e.ctrlKey && !e.metaKey && isMultiSelected) {
								props.reselect(props.element);
							}
						}}
						style={{
							height: "100%",
							width: "100%",
							opacity: 0,
							cursor: props.isSpacePressed ? "inherit" : (props.element.placementControl === "auto" ? "default" : "move")
						}}>
					</div>

					{props.element.placementControl === "auto" && (
						<div style={{
							position: "absolute",
							top: -3,
							left: -8,
							display: "flex",
							lineHeight: 0
						}}>
							<Tooltip content="Element automatically positioned" placement="top">
								<Icon icon="lock" color="grey" size={6} />
							</Tooltip>
						</div>
					)}
				</div>

				<svg
					style={{

						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
						zIndex: 2000,
						overflow: "visible",
						opacity: (isDraggingThisOrPeer || props.isHidden) ? 0 : 1,

					}}>



					{props.element.padding.some((v) => v > 0) ? (
						<rect
							x={props.element.drawX}
							y={props.element.drawY}
							width={props.element.drawWidth}
							height={props.element.drawHeight}
							style={{
								stroke: isDraggingThisOrPeer ? `none` : `${Colors.GRAY3}`,
								strokeWidth: "1px",
								fill: `${Colors.GRAY5}`,
								fillOpacity: "10%",
								strokeDasharray: "2 2"
							}}></rect>
					) : (
						<></>
					)}

					<g
						transform={`translate(${visualX}, ${visualY}) scale(${visualScaleX}, ${visualScaleY})`}
						style={{
							transformOrigin: "0 0",
							opacity: lineLivePreview !== null ? 0 : 1
						}}>
						<svg
							ref={visualRef}
							x={0}
							y={0}
							width="100%"
							height="100%"
							style={{ overflow: "visible" }}></svg>
					</g>



					{props.visualState === "hovered" && (
						<rect
							x={props.element.drawCX}
							y={props.element.drawCY}
							width={props.element.drawContentWidth}
							height={props.element.drawContentHeight}
							style={{
								stroke: isDraggingThisOrPeer ? `none` : (props.element.placementControl === "auto" ? `${Colors.BLUE5}` : `${Colors.BLUE3}`),
								strokeWidth: "1px",
								fill: "transparent",
								strokeDasharray: "2 2",
							}}></rect>
					)}
					{props.visualState === "selected" && !isMultiSelected && !(props.element instanceof LineLike) && (
						<rect
							className="selection-single-box"
							x={visualX}
							y={visualY}
							width={visualWidth}
							height={visualHeight}
							style={{
								stroke: isDraggingThisOrPeer ? "none" : (props.element.placementControl === "auto" ? `${Colors.BLUE5}` : `${Colors.BLUE3}`),
								strokeWidth: "1px",
								fill: `${Colors.BLUE5}`,
								fillOpacity: "10%",
								strokeDasharray: "none",
								pointerEvents: "none"
							}}></rect>
					)}
					{props.visualState === "selected" && isMultiSelected && isFirstSelectedElement && unionBoundingBox && (
						<rect
							className="selection-union-box"
							x={unionBoundingBox.x}
							y={unionBoundingBox.y}
							width={unionBoundingBox.width}
							height={unionBoundingBox.height}
							style={{
								stroke: isDraggingThisOrPeer ? `none` : `${Colors.BLUE3}`,
								strokeWidth: "1.5px",
								fill: "none",
								strokeDasharray: "none"
							}}></rect>
					)}
					{props.visualState === "selected" && isMultiSelected && (
						<rect
							className="selection-element-box"
							x={props.element.drawCX}
							y={props.element.drawCY}
							width={props.element.drawContentWidth}
							height={props.element.drawContentHeight}
							style={{
								stroke: isDraggingThisOrPeer ? `none` : `${Colors.BLUE3}`,
								strokeWidth: "1.5px",
								fill: `${Colors.BLUE5}`,
								fillOpacity: "6%",
								strokeDasharray: "none"
							}}></rect>
					)}

					{showOffsetIndicator && (
						<g className="offset-indicator">
							<line
								x1={drawnCenterX}
								y1={drawnCenterY}
								x2={layoutCenterX}
								y2={layoutCenterY}
								stroke={Colors.BLUE3}
								strokeWidth="1px"
								strokeDasharray="1 1"
								opacity="0.8"
							/>
							<circle
								cx={layoutCenterX}
								cy={layoutCenterY}
								r="2"
								fill={Colors.GRAY1}
								strokeWidth="1.5px"
								opacity="0.5"
							/>

						</g>
					)}
				</svg>

				{props.visualState === "selected" && !isMultiSelected && !isDraggingThisOrPeer && !props.isHidden && props.element.placementControl !== "auto" && (
					props.element instanceof LineLike ? (
						<CanvasLineResizeHandles
							element={props.element}
							scale={props.scale}
							onResize={setLineLivePreview}
							hoveredElement={props.hoveredElement}
						/>
					) : props.element.isResizable ? (
						<CanvasResizeHandles
							element={props.element}
							scale={props.scale}
							onResize={setLivePreview}
							hoveredElement={props.hoveredElement}
						/>
					) : null
				)}

				{props.visualState === "selected" && isMultiSelected && isFirstSelectedElement && unionBoundingBox && !isDraggingThisOrPeer && !props.isHidden && canGroup && (
					<div
						className="nopan"
						style={{
							...FLOATING_ACTION_CONTAINER_STYLE,
							left: unionBoundingBox.x + unionBoundingBox.width,
							top: unionBoundingBox.y
						}}
						onMouseDown={(e) => {
							e.stopPropagation();
						}}
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<Tooltip content="Group selection into a collection" placement="top">
							<Button
								icon="layers"
								text="Group"
								small
								intent="primary"
								onClick={(e) => {
									e.stopPropagation();
									dispatch(handleGroupSelectedElements());
								}}
								style={FLOATING_ACTION_BUTTON_STYLE}
							/>
						</Tooltip>
					</div>
				)}

				{props.visualState === "selected" && !isMultiSelected && !isDraggingThisOrPeer && !props.isHidden && isInsideGroup && (
					<div
						className="nopan"
						style={{
							...FLOATING_ACTION_CONTAINER_STYLE,
							left: props.element.drawBound.right,
							top: props.element.drawBound.top
						}}
						onMouseDown={(e) => {
							e.stopPropagation();
						}}
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<Tooltip content="Remove element from group" placement="top">
							<Button
								icon="ungroup-objects"
								text="Ungroup"
								small
								intent="primary"
								onClick={(e) => {
									e.stopPropagation();
									dispatch(handleUngroupElement({ elementId: props.element.id }));
								}}
								style={FLOATING_ACTION_BUTTON_STYLE}
							/>
						</Tooltip>
					</div>
				)}
			</>
		);
	}
);

export default CanvasDraggableElement;
