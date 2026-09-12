import React, { useState, useEffect, useCallback, useRef } from "react";
import { IToolConfig, Tool } from "../../app/App";
import { DEFAULT_LINE } from "../../logic/default/line";
import ENGINE from "../../logic/engine";
import Line, { HeadStyle, ILineStyle, ILine } from "../../logic/line";
import Spacial, { PlacementConfiguration, ISequenceBindingRule } from "../../logic/spacial";
import Visual from "../../logic/visual";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";
import BindingsSelector, { ISelectedBindingInfo } from "./BindingsSelector";
import {
	findClosestBindingAnchor,
	isBindingAllowedAsTarget
} from "./bindingUtil";
import { createPlacementRulesForBinding, determineBindingPlacementModeType } from "../../logic/bindingUtil";
import { snapPoint, SnapStore } from "../../logic/snapping";

export interface IDrawArrowConfig extends IToolConfig {
	thickness?: number;
	lineStyle: ILineStyle;
	mode?: "vertical" | "bind" | "free";
}

interface IDrawArrowProps {
	hoveredElement?: Spacial | undefined;
	config: IDrawArrowConfig;
	zoom?: number;
	setTool: (tool: Tool) => void;
}


export function LineTool(props: IDrawArrowProps) {
	const dispatch = useAppDispatch();
	const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
	const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
	const [snappedAnchorKey, setSnappedAnchorKey] = useState<string | null>(null);

	const startPointRef = useRef<{ x: number; y: number } | null>(null);
	const startBindingRef = useRef<ISelectedBindingInfo | null>(null);
	const snappedBindingRef = useRef<ISelectedBindingInfo | null>(null);
	const rawPointRef = useRef<{ x: number; y: number } | null>(null);
	const isCtrlPressedRef = useRef<boolean>(false);

	const hoveredElementRef = useRef(props.hoveredElement);
	hoveredElementRef.current = props.hoveredElement;

	const getCanvasCoords = useCallback(
		(e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
			const drawDiv = document.getElementById("diagram-root") as HTMLElement;
			const currentZoom = props.zoom && props.zoom > 0 ? props.zoom : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);
			if (!drawDiv) {
				return { x: e.clientX, y: e.clientY };
			}
			const drawDivRect = drawDiv.getBoundingClientRect();
			const relativeX = (e.clientX - drawDivRect.left) / currentZoom;
			const relativeY = (e.clientY - drawDivRect.top) / currentZoom;
			return { x: relativeX, y: relativeY };
		},
		[props.zoom]
	);

	const computeSnappedPoint = useCallback((raw: { x: number; y: number }, origin: { x: number; y: number }, isCtrl: boolean) => {
		if (!isCtrl) return raw;
		const dx = raw.x - origin.x;
		const dy = raw.y - origin.y;
		return Math.abs(dx) >= Math.abs(dy)
			? { x: raw.x, y: origin.y }
			: { x: origin.x, y: raw.y };
	}, []);

	const commitLine = useCallback(
		(
			startPt: { x: number; y: number },
			endPt: { x: number; y: number },
			startBindingInfo: ISelectedBindingInfo | null,
			endBindingInfo: ISelectedBindingInfo | null
		) => {
			const dist = Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);
			const hasBindings = Boolean(startBindingInfo || endBindingInfo);

			if (dist < 2 && !hasBindings) {
				return;
			}

			const stroke = props.config?.lineStyle?.stroke ?? "#000000";
			const dashing = props.config?.lineStyle?.dashing ?? [0, 0];
			const headStyle = props.config?.lineStyle?.headStyle ?? ["none", "default"];
			const thickness = props.config?.thickness ?? 2;

			const allRules: ISequenceBindingRule[] = [];

			if (startBindingInfo) {
				allRules.push(...createPlacementRulesForBinding(startBindingInfo, "start", "start"));
			}

			if (endBindingInfo) {
				allRules.push(...createPlacementRulesForBinding(endBindingInfo, "end", "end"));
			}

			const placementMode: PlacementConfiguration = determineBindingPlacementModeType(allRules);

			const newLine: ILine = {
				...structuredClone(DEFAULT_LINE),
				id: Math.random().toString(16).slice(2),
				ref: `arrow-${Date.now()}`,
				type: "line",
				parentId: ENGINE.handler.diagram.id,
				placementMode: placementMode,
				placementControl: "user",
				startX: startPt.x,
				startY: startPt.y,
				endX: endPt.x,
				endY: endPt.y,
				x: Math.min(startPt.x, endPt.x),
				y: Math.min(startPt.y, endPt.y),
				thickness: thickness,
				adjustment: [0, 0],
				padding: [0, 0, 0, 0],
				offset: [0, 0],
				lineStyle: {
					stroke: stroke,
					dashing: dashing,
					headStyle: headStyle
				}
			};

			ENGINE.handler.act({
				type: "add",
				input: {
					child: newLine
				}
			});

			dispatch(setSelectedElementId(newLine.id));
			props.setTool({ type: "select", config: {} });

			SnapStore.clear();
			setStartPoint(null);
			startPointRef.current = null;
			startBindingRef.current = null;
			setCurrentPoint(null);
			rawPointRef.current = null;
			setSnappedAnchorKey(null);
			snappedBindingRef.current = null;
		},
		[props, dispatch]
	);

	const handleSelectBind = useCallback(
		(info: ISelectedBindingInfo) => {
			if (!isBindingAllowedAsTarget(info.anchorObject)) return;
			SnapStore.clear();
			if (!startPointRef.current) {
				setStartPoint(info.point);
				startPointRef.current = info.point;
				startBindingRef.current = info;
				setCurrentPoint(info.point);
				rawPointRef.current = info.point;
			} else {
				commitLine(startPointRef.current, info.point, startBindingRef.current, info);
			}
		},
		[commitLine]
	);

	const updateCurrentPosition = useCallback(
		(rawCoords: { x: number; y: number }, isCtrl: boolean) => {
			rawPointRef.current = rawCoords;

			const currentZoom = props.zoom && props.zoom > 0 ? props.zoom : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);
			const snap = findClosestBindingAnchor(hoveredElementRef.current, "", rawCoords, currentZoom);
			snappedBindingRef.current = snap?.bindingInfo ?? null;
			setSnappedAnchorKey(snap?.key ?? null);

			if (snap) {
				SnapStore.clear();
				if (startPointRef.current) {
					setCurrentPoint(snap.bindingInfo.point);
				}
				return;
			}

			const pointToSnap = startPointRef.current
				? computeSnappedPoint(rawCoords, startPointRef.current, isCtrl)
				: rawCoords;

			const snapRes = snapPoint({
				point: pointToSnap,
				scale: currentZoom
			});

			let pt = pointToSnap;
			if (snapRes.guides.length > 0) {
				pt = { x: snapRes.x, y: snapRes.y };
				if (startPointRef.current) {
					const start = startPointRef.current;
					const guides = snapRes.guides.map((g) => {
						if (g.orientation === "vertical") {
							return {
								...g,
								start: Math.min(g.start, start.y, pt.y) - 4,
								end: Math.max(g.end, start.y, pt.y) + 4
							};
						} else {
							return {
								...g,
								start: Math.min(g.start, start.x, pt.x) - 4,
								end: Math.max(g.end, start.x, pt.x) + 4
							};
						}
					});
					SnapStore.setGuides(guides);
				} else {
					SnapStore.setGuides(snapRes.guides);
				}
			} else {
				SnapStore.clear();
			}

			if (startPointRef.current) {
				setCurrentPoint(pt);
			}
		},
		[props.zoom, computeSnappedPoint]
	);

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();

		const rawCoords = getCanvasCoords(e);
		rawPointRef.current = rawCoords;

		const currentZoom = props.zoom && props.zoom > 0 ? props.zoom : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);
		const snap = findClosestBindingAnchor(hoveredElementRef.current, "", rawCoords, currentZoom);
		const effectiveSnap = snap?.bindingInfo ?? snappedBindingRef.current;

		if (!startPointRef.current) {
			let initialPt = rawCoords;
			if (effectiveSnap) {
				initialPt = effectiveSnap.point;
			} else {
				const snapRes = snapPoint({ point: rawCoords, scale: currentZoom });
				if (snapRes.guides.length > 0) {
					initialPt = { x: snapRes.x, y: snapRes.y };
				}
			}
			SnapStore.clear();
			setStartPoint(initialPt);
			startPointRef.current = initialPt;
			startBindingRef.current = effectiveSnap ?? null;
			setCurrentPoint(initialPt);
		} else {
			const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
			let endPt = computeSnappedPoint(rawCoords, startPointRef.current, isCtrl);
			if (effectiveSnap) {
				endPt = effectiveSnap.point;
			} else {
				const snapRes = snapPoint({ point: endPt, scale: currentZoom });
				if (snapRes.guides.length > 0) {
					endPt = { x: snapRes.x, y: snapRes.y };
				}
			}
			SnapStore.clear();
			commitLine(startPointRef.current, endPt, startBindingRef.current, effectiveSnap ?? null);
		}
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
		const coords = getCanvasCoords(e);
		updateCurrentPosition(coords, isCtrl);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				SnapStore.clear();
				setStartPoint(null);
				startPointRef.current = null;
				startBindingRef.current = null;
				setCurrentPoint(null);
				rawPointRef.current = null;
				setSnappedAnchorKey(null);
				snappedBindingRef.current = null;
				props.setTool({ type: "select", config: {} });
			} else if (e.key === "Control") {
				isCtrlPressedRef.current = true;
				if (startPointRef.current && rawPointRef.current && !snappedBindingRef.current) {
					const snapped = computeSnappedPoint(rawPointRef.current, startPointRef.current, true);
					setCurrentPoint(snapped);
				}
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Control") {
				isCtrlPressedRef.current = false;
				if (startPointRef.current && rawPointRef.current && !snappedBindingRef.current) {
					setCurrentPoint(rawPointRef.current);
				}
			}
		};

		const handleBlur = () => {
			isCtrlPressedRef.current = false;
			if (startPointRef.current && rawPointRef.current && !snappedBindingRef.current) {
				setCurrentPoint(rawPointRef.current);
			}
		};

		const handleGlobalMouseMove = (e: MouseEvent) => {
			const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
			const coords = getCanvasCoords(e);
			updateCurrentPosition(coords, isCtrl);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		window.addEventListener("blur", handleBlur);
		window.addEventListener("mousemove", handleGlobalMouseMove);

		return () => {
			SnapStore.clear();
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("blur", handleBlur);
			window.removeEventListener("mousemove", handleGlobalMouseMove);
		};
	}, [props, getCanvasCoords, computeSnappedPoint, updateCurrentPosition]);

	const stroke = props.config?.lineStyle?.stroke ?? "#000000";
	const dashing = props.config?.lineStyle?.dashing ?? [0, 0];
	const headStyle = props.config?.lineStyle?.headStyle ?? ["none", "default"];
	const thickness = props.config?.thickness ?? 2;

	let adjStartX = startPoint?.x ?? 0;
	let adjStartY = startPoint?.y ?? 0;
	let adjEndX = currentPoint?.x ?? 0;
	let adjEndY = currentPoint?.y ?? 0;

	if (startPoint && currentPoint) {
		const dx = currentPoint.x - startPoint.x;
		const dy = currentPoint.y - startPoint.y;
		const length = Math.hypot(dx, dy);

		const startMarkerLength = Line.MARKER_LENGTHS[headStyle[0]] ?? 0;
		const endMarkerLength = Line.MARKER_LENGTHS[headStyle[1]] ?? 0;

		const startOffset = thickness * startMarkerLength;
		const endOffset = thickness * endMarkerLength;

		if (length > (startOffset + endOffset)) {
			const angle = Math.atan2(dy, dx);
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			adjStartX = startPoint.x + cos * startOffset;
			adjStartY = startPoint.y + sin * startOffset;
			adjEndX = currentPoint.x - cos * endOffset;
			adjEndY = currentPoint.y - sin * endOffset;
		} else {
			adjStartX = startPoint.x;
			adjStartY = startPoint.y;
			adjEndX = currentPoint.x;
			adjEndY = currentPoint.y;
		}
	}

	return (
		<>
			{/* Mouse capture backdrop covering negative and positive diagram space */}
			<div
				className="nopan"
				style={{
					position: "absolute",
					left: "-50000px",
					top: "-50000px",
					width: "100000px",
					height: "100000px",
					pointerEvents: "auto",
					cursor: "crosshair",
					zIndex: 10002
				}}
				onClick={handleClick}
				onMouseMove={handleMouseMove}
			/>

			{/* Hovered Element Bindings Selector */}
			{isBindingAllowedAsTarget(props.hoveredElement) && props.hoveredElement && (
				<BindingsSelector
					element={props.hoveredElement}
					onSelectBind={handleSelectBind}
					activeAnchorKey={snappedAnchorKey}
				/>
			)}

			{/* Live Arrow Preview SVG */}
			{startPoint && currentPoint && (
				<svg
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
						overflow: "visible",
						zIndex: 10003
					}}
				>
					<defs>
						<marker
							id="preview-marker-default"
							refX={0}
							refY={1.5}
							markerWidth={3}
							markerHeight={3}
							orient="auto-start-reverse"
						>
							<path d="M 0 0 L 3 1.5 L 0 3 z" fill={stroke} />
						</marker>
						<marker
							id="preview-marker-thin"
							refX={0}
							refY={1}
							markerWidth={4}
							markerHeight={2}
							orient="auto-start-reverse"
						>
							<path d="M 0 0 L 4 1 L 0 2 z" fill={stroke} />
						</marker>
						<marker
							id="preview-marker-bracket"
							refX={1}
							refY={0.5}
							markerWidth={2}
							markerHeight={Line.BRACKET_ARM_LENGTH}
							orient="auto"
						>
							<path d={`M 0.5 0 L 1.5 0 L 1.5 ${Line.BRACKET_ARM_LENGTH} L 0.5 ${Line.BRACKET_ARM_LENGTH} z`} fill={stroke} />
						</marker>
					</defs>

					{/* Arrow path */}
					<path
						d={`M ${adjStartX} ${adjStartY} L ${adjEndX} ${adjEndY}`}
						stroke={stroke}
						strokeWidth={thickness}
						strokeLinecap="butt"
						strokeDasharray={dashing[0] > 0 ? `${dashing[0]} ${dashing[1]}` : undefined}
						markerStart={headStyle[0] !== "none" ? `url(#preview-marker-${headStyle[0]})` : undefined}
						markerEnd={headStyle[1] !== "none" ? `url(#preview-marker-${headStyle[1]})` : undefined}
					/>
				</svg>
			)}
		</>
	);
}

export default LineTool;
