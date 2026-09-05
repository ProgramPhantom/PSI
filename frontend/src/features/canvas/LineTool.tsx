import React, { useState, useEffect, useCallback } from "react";
import { IToolConfig, Tool } from "../../app/App";
import { DEFAULT_LINE } from "../../logic/default/line";
import ENGINE from "../../logic/engine";
import { HeadStyle, ILineStyle, ILine } from "../../logic/line";
import { IBindEndpointConfig, PlacementConfiguration } from "../../logic/spacial";
import Visual from "../../logic/visual";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";
import BindingsSelector, { ISelectedBindingInfo } from "./BindingsSelector";

export interface IDrawArrowConfig extends IToolConfig {
	thickness?: number;
	lineStyle: ILineStyle;
	mode?: "vertical" | "bind" | "free";
}

interface IDrawArrowProps {
	hoveredElement?: Visual | undefined;
	config: IDrawArrowConfig;
	zoom?: number;
	setTool: (tool: Tool) => void;
}

const MARKER_LENGTHS: Record<HeadStyle, number> = {
	default: 3,
	thin: 4,
	none: 0
};

export function LineTool(props: IDrawArrowProps) {
	const dispatch = useAppDispatch();
	const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
	const [startBinding, setStartBinding] = useState<IBindEndpointConfig | null>(null);
	const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

	const rawPointRef = React.useRef<{ x: number; y: number } | null>(null);
	const isCtrlPressedRef = React.useRef<boolean>(false);

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

	const updateCurrentPosition = useCallback((rawCoords: { x: number; y: number }, isCtrl: boolean) => {
		rawPointRef.current = rawCoords;
		if (startPoint) {
			const finalCoords = computeSnappedPoint(rawCoords, startPoint, isCtrl);
			setCurrentPoint(finalCoords);
		}
	}, [startPoint, computeSnappedPoint]);

	const commitLine = useCallback((endPoint: { x: number; y: number }, endBindingInfo: IBindEndpointConfig | null) => {
		if (!startPoint) return;
		const dist = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
		if (dist < 2 && !startBinding && !endBindingInfo) {
			return;
		}

		const stroke = props.config?.lineStyle?.stroke ?? "#000000";
		const dashing = props.config?.lineStyle?.dashing ?? [0, 0];
		const headStyle = props.config?.lineStyle?.headStyle ?? ["none", "default"];
		const thickness = props.config?.thickness ?? 2;

		const placementMode: PlacementConfiguration = (startBinding || endBindingInfo)
			? {
				type: "binds",
				config: {
					...(startBinding ? { start: startBinding } : {}),
					...(endBindingInfo ? { end: endBindingInfo } : {})
				}
			}
			: { type: "free" };

		const newLine: ILine = {
			...structuredClone(DEFAULT_LINE),
			id: Math.random().toString(16).slice(2),
			ref: `arrow-${Date.now()}`,
			type: "line",
			parentId: ENGINE.handler.diagram.id,
			placementMode: placementMode,
			placementControl: "user",
			startX: startPoint.x,
			startY: startPoint.y,
			endX: endPoint.x,
			endY: endPoint.y,
			x: Math.min(startPoint.x, endPoint.x),
			y: Math.min(startPoint.y, endPoint.y),
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
		setStartPoint(null);
		setStartBinding(null);
		setCurrentPoint(null);
		rawPointRef.current = null;
	}, [startPoint, startBinding, props, dispatch]);

	const handleSelectBind = (info: ISelectedBindingInfo) => {
		const bindConfig: IBindEndpointConfig = {
			targetId: info.anchorObject.id,
			xAnchor: info.xAnchor,
			yAnchor: info.yAnchor
		};

		if (!startPoint) {
			setStartPoint(info.point);
			setStartBinding(bindConfig);
			setCurrentPoint(info.point);
			rawPointRef.current = info.point;
		} else {
			commitLine(info.point, bindConfig);
		}
	};

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();

		const rawCoords = getCanvasCoords(e);
		rawPointRef.current = rawCoords;

		if (!startPoint) {
			setStartPoint(rawCoords);
			setStartBinding(null);
			setCurrentPoint(rawCoords);
		} else {
			const isCtrl = e.ctrlKey || isCtrlPressedRef.current;
			const coords = computeSnappedPoint(rawCoords, startPoint, isCtrl);
			commitLine(coords, null);
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
				setStartBinding(null);
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

		const startMarkerLength = MARKER_LENGTHS[headStyle[0]] ?? 0;
		const endMarkerLength = MARKER_LENGTHS[headStyle[1]] ?? 0;

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
			{props.hoveredElement && props.hoveredElement.type !== "diagram" && (
				<BindingsSelector
					element={props.hoveredElement}
					onSelectBind={handleSelectBind}
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
