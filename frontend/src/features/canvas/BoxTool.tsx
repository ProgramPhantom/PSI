import React, { useState, useEffect, useCallback, useRef } from "react";
import { IToolConfig, Tool } from "../../app/App";
import { DEFAULT_RECT_ELEMENT } from "../../logic/default/rectElement";
import ENGINE from "../../logic/engine";
import { IRectElement, IRectStyle } from "../../logic/rectElement";
import { IPlacementBindingRule, PlacementConfiguration, SiteNames } from "../../logic/spacial";
import Visual from "../../logic/visual";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";
import BindingsSelector, { ISelectedBindingInfo } from "./BindingsSelector";
import { findClosestBindingAnchor, isBindingAllowedAsTarget } from "./bindingResizeConfig";

export interface IDrawBoxConfig extends IToolConfig {
	style?: IRectStyle;
}

interface IDrawBoxProps {
	hoveredElement?: Visual | undefined;
	config?: IDrawBoxConfig;
	zoom?: number;
	setTool: (tool: Tool) => void;
}

export function BoxTool(props: IDrawBoxProps) {
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
		const side = Math.max(Math.abs(dx), Math.abs(dy));
		return {
			x: origin.x + Math.sign(dx || 1) * side,
			y: origin.y + Math.sign(dy || 1) * side
		};
	}, []);

	const commitBox = useCallback(
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

			const fill = props.config?.style?.fill ?? "#137cbd";
			const stroke = props.config?.style?.stroke ?? "#137cbd";
			const strokeWidth = props.config?.style?.strokeWidth ?? 2;
			const dashing = props.config?.style?.dashing ?? [0, 0];

			const minX = Math.min(startPt.x, endPt.x);
			const minY = Math.min(startPt.y, endPt.y);
			const width = Math.max(Math.abs(endPt.x - startPt.x), 5);
			const height = Math.max(Math.abs(endPt.y - startPt.y), 5);

			// Smart selection of target site names based on drag direction:
			// In X: the point with smaller X is the left boundary ("here"),
			//       the point with larger X is the right boundary ("far").
			// In Y: the point with smaller Y is the top boundary ("here"),
			//       the point with larger Y is the bottom boundary ("far").
			const isXStartNear = startPt.x <= endPt.x;
			const isYStartNear = startPt.y <= endPt.y;

			const startXSite: SiteNames = isXStartNear ? "here" : "far";
			const startYSite: SiteNames = isYStartNear ? "here" : "far";
			const endXSite: SiteNames = isXStartNear ? "far" : "here";
			const endYSite: SiteNames = isYStartNear ? "far" : "here";

			const allRules: IPlacementBindingRule[] = [];

			if (startBindingInfo) {
				allRules.push(
					{
						targetId: startBindingInfo.anchorObject.id,
						dimension: "x",
						anchorSiteName: startBindingInfo.xAnchor,
						targetSiteName: startXSite,
						bindToContent: true
					},
					{
						targetId: startBindingInfo.anchorObject.id,
						dimension: "y",
						anchorSiteName: startBindingInfo.yAnchor,
						targetSiteName: startYSite,
						bindToContent: true
					}
				);
			}

			if (endBindingInfo) {
				allRules.push(
					{
						targetId: endBindingInfo.anchorObject.id,
						dimension: "x",
						anchorSiteName: endBindingInfo.xAnchor,
						targetSiteName: endXSite,
						bindToContent: true
					},
					{
						targetId: endBindingInfo.anchorObject.id,
						dimension: "y",
						anchorSiteName: endBindingInfo.yAnchor,
						targetSiteName: endYSite,
						bindToContent: true
					}
				);
			}

			const placementMode: PlacementConfiguration = allRules.length > 0
				? {
					type: "binds",
					config: allRules
				}
				: { type: "free" };

			const newRect: IRectElement = {
				...structuredClone(DEFAULT_RECT_ELEMENT),
				id: Math.random().toString(16).slice(2),
				ref: `box-${Date.now()}`,
				type: "rect",
				parentId: ENGINE.handler.diagram.id,
				placementMode: placementMode,
				placementControl: "user",
				x: minX,
				y: minY,
				contentWidth: width,
				contentHeight: height,
				sizeMode: { x: "fixed", y: "fixed" },
				style: {
					fill: fill,
					stroke: stroke,
					strokeWidth: strokeWidth,
					...(dashing && dashing[0] > 0 ? { dashing } : {})
				}
			};

			ENGINE.handler.act({
				type: "add",
				input: {
					child: newRect
				}
			});

			dispatch(setSelectedElementId(newRect.id));
			props.setTool({ type: "select", config: {} });

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
			if (!startPointRef.current) {
				setStartPoint(info.point);
				startPointRef.current = info.point;
				startBindingRef.current = info;
				setCurrentPoint(info.point);
				rawPointRef.current = info.point;
			} else {
				commitBox(startPointRef.current, info.point, startBindingRef.current, info);
			}
		},
		[commitBox]
	);

	const updateCurrentPosition = useCallback(
		(rawCoords: { x: number; y: number }, isCtrl: boolean) => {
			rawPointRef.current = rawCoords;

			const currentZoom = props.zoom && props.zoom > 0 ? props.zoom : (ENGINE.surface?.node?.getScreenCTM()?.a || 1);
			const snap = findClosestBindingAnchor(hoveredElementRef.current, "", rawCoords, currentZoom);
			snappedBindingRef.current = snap?.bindingInfo ?? null;
			setSnappedAnchorKey(snap?.key ?? null);

			if (startPointRef.current) {
				let pt: { x: number; y: number };
				if (snap) {
					pt = snap.bindingInfo.point;
				} else {
					pt = computeSnappedPoint(rawCoords, startPointRef.current, isCtrl);
				}
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
			const initialPt = effectiveSnap ? effectiveSnap.point : rawCoords;
			setStartPoint(initialPt);
			startPointRef.current = initialPt;
			startBindingRef.current = effectiveSnap ?? null;
			setCurrentPoint(initialPt);
		} else {
			const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
			const endPt = effectiveSnap
				? effectiveSnap.point
				: computeSnappedPoint(rawCoords, startPointRef.current, isCtrl);
			commitBox(startPointRef.current, endPt, startBindingRef.current, effectiveSnap ?? null);
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
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("blur", handleBlur);
			window.removeEventListener("mousemove", handleGlobalMouseMove);
		};
	}, [props, getCanvasCoords, computeSnappedPoint, updateCurrentPosition]);

	const fill = props.config?.style?.fill ?? "#137cbd";
	const stroke = props.config?.style?.stroke ?? "#137cbd";
	const strokeWidth = props.config?.style?.strokeWidth ?? 2;
	const dashing = props.config?.style?.dashing ?? [0, 0];

	const previewX = startPoint && currentPoint ? Math.min(startPoint.x, currentPoint.x) : 0;
	const previewY = startPoint && currentPoint ? Math.min(startPoint.y, currentPoint.y) : 0;
	const previewWidth = startPoint && currentPoint ? Math.abs(currentPoint.x - startPoint.x) : 0;
	const previewHeight = startPoint && currentPoint ? Math.abs(currentPoint.y - startPoint.y) : 0;

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

			{/* Live Box Preview SVG */}
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
					<rect
						x={previewX}
						y={previewY}
						width={previewWidth}
						height={previewHeight}
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth}
						strokeDasharray={dashing && dashing[0] > 0 ? `${dashing[0]} ${dashing[1]}` : undefined}
						shapeRendering="crispEdges"
					/>
				</svg>
			)}
		</>
	);
}

export default BoxTool;
