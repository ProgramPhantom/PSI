import React, { useState, useEffect, useCallback } from "react";
import { IToolConfig, Tool } from "../../app/App";
import { DEFAULT_LINE } from "../../logic/default/line";
import ENGINE from "../../logic/engine";
import { HeadStyle, ILineStyle, ILine } from "../../logic/line";
import Visual from "../../logic/visual";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";

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
	const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

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

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		e.preventDefault();

		const coords = getCanvasCoords(e);

		if (!startPoint) {
			setStartPoint(coords);
			setCurrentPoint(coords);
		} else {
			const dist = Math.hypot(coords.x - startPoint.x, coords.y - startPoint.y);
			if (dist < 2) {
				return;
			}

			const stroke = props.config?.lineStyle?.stroke ?? "#000000";
			const dashing = props.config?.lineStyle?.dashing ?? [0, 0];
			const headStyle = props.config?.lineStyle?.headStyle ?? ["none", "default"];
			const thickness = props.config?.thickness ?? 2;

			const newLine: ILine = {
				...structuredClone(DEFAULT_LINE),
				id: Math.random().toString(16).slice(2),
				ref: `arrow-${Date.now()}`,
				type: "line",
				parentId: ENGINE.handler.diagram.id,
				placementMode: { type: "free" },
				placementControl: "user",
				startX: startPoint.x,
				startY: startPoint.y,
				endX: coords.x,
				endY: coords.y,
				x: Math.min(startPoint.x, coords.x),
				y: Math.min(startPoint.y, coords.y),
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
			setCurrentPoint(null);
		}
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (startPoint) {
			const coords = getCanvasCoords(e);
			setCurrentPoint(coords);
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setStartPoint(null);
				setCurrentPoint(null);
				props.setTool({ type: "select", config: {} });
			}
		};

		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (startPoint) {
				const coords = getCanvasCoords(e);
				setCurrentPoint(coords);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("mousemove", handleGlobalMouseMove);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("mousemove", handleGlobalMouseMove);
		};
	}, [startPoint, getCanvasCoords, props]);

	const stroke = props.config?.lineStyle?.stroke ?? "#000000";
	const dashing = props.config?.lineStyle?.dashing ?? [0, 0];
	const headStyle = props.config?.lineStyle?.headStyle ?? ["none", "default"];
	const thickness = props.config?.thickness ?? 2;

	let adjStartX = 0;
	let adjStartY = 0;
	let adjEndX = 0;
	let adjEndY = 0;

	if (startPoint && currentPoint) {
		const dx = currentPoint.x - startPoint.x;
		const dy = currentPoint.y - startPoint.y;
		const angle = Math.atan2(dy, dx);
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		const startMarkerLength = MARKER_LENGTHS[headStyle[0]] ?? 0;
		const endMarkerLength = MARKER_LENGTHS[headStyle[1]] ?? 0;

		const startOffset = thickness * startMarkerLength;
		const endOffset = thickness * endMarkerLength;

		adjStartX = startPoint.x + cos * startOffset;
		adjStartY = startPoint.y + sin * startOffset;
		adjEndX = currentPoint.x - cos * endOffset;
		adjEndY = currentPoint.y - sin * endOffset;
	}

	return (
		<div
			className="nopan"
			style={{
				position: "absolute",
				left: -10000,
				top: -10000,
				width: 20000,
				height: 20000,
				pointerEvents: "auto",
				cursor: "crosshair",
				zIndex: 10002
			}}
			onClick={handleClick}
			onMouseMove={handleMouseMove}
		>
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

					{/* Start point anchor circle */}
					<circle
						cx={startPoint.x}
						cy={startPoint.y}
						r={Math.max(2.5, thickness)}
						fill={stroke}
						opacity={0.7}
					/>

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

					{/* Subtle endpoint guide circle */}
					<circle
						cx={currentPoint.x}
						cy={currentPoint.y}
						r={Math.max(2, thickness * 0.8)}
						fill={stroke}
						opacity={0.4}
					/>
				</svg>
			)}
		</div>
	);
}

export default LineTool;
