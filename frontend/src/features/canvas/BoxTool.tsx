import React, { useState, useEffect, useCallback, useRef } from "react";
import { IToolConfig, Tool } from "../../app/App";
import { DEFAULT_RECT_ELEMENT } from "../../logic/default/rectElement";
import ENGINE from "../../logic/engine";
import { IRectElement, IRectStyle } from "../../logic/rectElement";
import { IPlacementBindingRule, PlacementConfiguration } from "../../logic/spacial";
import Visual from "../../logic/visual";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";
import BindingsSelector, { ISelectedBindingInfo } from "./BindingsSelector";

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
	const [startBindingRules, setStartBindingRules] = useState<IPlacementBindingRule[] | null>(null);
	const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

	const rawPointRef = useRef<{ x: number; y: number } | null>(null);
	const isCtrlPressedRef = useRef<boolean>(false);

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

	const updateCurrentPosition = useCallback((rawCoords: { x: number; y: number }, isCtrl: boolean) => {
		rawPointRef.current = rawCoords;
		if (startPoint) {
			const finalCoords = computeSnappedPoint(rawCoords, startPoint, isCtrl);
			setCurrentPoint(finalCoords);
		}
	}, [startPoint, computeSnappedPoint]);

	const commitBox = useCallback((endPoint: { x: number; y: number }, endBindingRules: IPlacementBindingRule[] | null) => {
		if (!startPoint) return;
		const dist = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
		const allRules: IPlacementBindingRule[] = [
			...(startBindingRules ?? []),
			...(endBindingRules ?? [])
		];

		if (dist < 2 && allRules.length === 0) {
			return;
		}

		const fill = props.config?.style?.fill ?? "#137cbd";
		const stroke = props.config?.style?.stroke ?? "#137cbd";
		const strokeWidth = props.config?.style?.strokeWidth ?? 2;
		const dashing = props.config?.style?.dashing ?? [0, 0];

		const minX = Math.min(startPoint.x, endPoint.x);
		const minY = Math.min(startPoint.y, endPoint.y);
		const width = Math.max(Math.abs(endPoint.x - startPoint.x), 5);
		const height = Math.max(Math.abs(endPoint.y - startPoint.y), 5);

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
		setStartBindingRules(null);
		setCurrentPoint(null);
		rawPointRef.current = null;
	}, [startPoint, startBindingRules, props, dispatch]);

	const handleSelectBind = (info: ISelectedBindingInfo) => {
		if (!startPoint) {
			const startRules: IPlacementBindingRule[] = [
				{
					targetId: info.anchorObject.id,
					dimension: "x",
					anchorSiteName: info.xAnchor,
					targetSiteName: "here",
					bindToContent: true
				},
				{
					targetId: info.anchorObject.id,
					dimension: "y",
					anchorSiteName: info.yAnchor,
					targetSiteName: "here",
					bindToContent: true
				}
			];
			setStartPoint(info.point);
			setStartBindingRules(startRules);
			setCurrentPoint(info.point);
			rawPointRef.current = info.point;
		} else {
			const endRules: IPlacementBindingRule[] = [
				{
					targetId: info.anchorObject.id,
					dimension: "x",
					anchorSiteName: info.xAnchor,
					targetSiteName: "far",
					bindToContent: true
				},
				{
					targetId: info.anchorObject.id,
					dimension: "y",
					anchorSiteName: info.yAnchor,
					targetSiteName: "far",
					bindToContent: true
				}
			];
			commitBox(info.point, endRules);
		}
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();

		const rawCoords = getCanvasCoords(e);
		rawPointRef.current = rawCoords;

		if (!startPoint) {
			setStartPoint(rawCoords);
			setStartBindingRules(null);
			setCurrentPoint(rawCoords);
		} else {
			const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
			const coords = computeSnappedPoint(rawCoords, startPoint, isCtrl);
			commitBox(coords, null);
		}
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (startPoint) {
			const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
			const coords = getCanvasCoords(e);
			updateCurrentPosition(coords, isCtrl);
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setStartPoint(null);
				setStartBindingRules(null);
				setCurrentPoint(null);
				rawPointRef.current = null;
				props.setTool({ type: "select", config: {} });
			} else if (e.key === "Control") {
				isCtrlPressedRef.current = true;
				if (startPoint && rawPointRef.current) {
					const snapped = computeSnappedPoint(rawPointRef.current, startPoint, true);
					setCurrentPoint(snapped);
				}
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Control") {
				isCtrlPressedRef.current = false;
				if (startPoint && rawPointRef.current) {
					setCurrentPoint(rawPointRef.current);
				}
			}
		};

		const handleBlur = () => {
			isCtrlPressedRef.current = false;
			if (startPoint && rawPointRef.current) {
				setCurrentPoint(rawPointRef.current);
			}
		};

		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (startPoint) {
				const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
				const coords = getCanvasCoords(e);
				updateCurrentPosition(coords, isCtrl);
			}
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
	}, [startPoint, getCanvasCoords, props, computeSnappedPoint, updateCurrentPosition]);

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
			{props.hoveredElement && props.hoveredElement.type !== "diagram" && (
				<BindingsSelector
					element={props.hoveredElement}
					onSelectBind={handleSelectBind}
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
