import {Path} from "@svgdotjs/svg.js";
import {useEffect, useRef, useState} from "react";
import {ILine, ILineStyle} from "../../logic/line";
import ENGINE from "../../logic/engine";
import {Dimensions, IBindingPayload} from "../../logic/spacial";
import {Visual} from "../../logic/visual";
import BindingsSelector from "./BindingsSelector";
import {IToolConfig, myToaster, Tool} from "../../app/App";
import Aligner from "../../logic/aligner";
import {Result} from "../../logic/diagramHandler";

interface IDrawArrowProps {
	hoveredElement: Visual | undefined;
	config: IDrawArrowConfig;
	setTool: (tool: Tool) => void;
}

export interface IDrawArrowConfig extends IToolConfig {
	lineStyle: ILineStyle;
	mode: "vertical" | "bind";
}

export type PointBind = Record<Dimensions, IBindingPayload>;

export function LineTool(props: IDrawArrowProps) {
	const [startCoords, setStartCoords] = useState<[number, number] | undefined>(undefined);
	const [columnHovered, setColumnHovered] = useState<boolean>(false);

	const start = useRef<PointBind | undefined>(undefined);
	const end = useRef<PointBind | undefined>(undefined);
	const [arrowIndicator, setArrowIndicator] = useState<Path | undefined>(undefined);
	const [previewPathSvg, setPreviewPathSvg] = useState<string | undefined>(undefined);
	const overlaySvgRef = useRef<SVGSVGElement | null>(null);

	const createArrow = (startBind: PointBind, endBind: PointBind) => {
		var result: Result<any> = ENGINE.handler.createLine(
			{lineStyle: props.config.lineStyle},
			startBind,
			endBind
		);

		if (result.ok == false) {
			myToaster.show({
				message: "Error adding line",
				intent: "danger"
			});
		}

		props.setTool({type: "select", config: {}});
	};

	const placeVerticalLine = (col: Aligner<Visual>, far: boolean = false) => {
		var topBindingPayloadX: IBindingPayload = {
			bindingRule: {
				anchorSiteName: !far ? "here" : "far",
				targetSiteName: "here",
				dimension: "x"
			},
			anchorObject: col
		};
		var topBindingPayloadY: IBindingPayload = {
			bindingRule: {
				anchorSiteName: "here",
				targetSiteName: "here",
				dimension: "y"
			},
			anchorObject: ENGINE.handler.diagram.components.sequences[0]!
		};

		var bottomBindingPayloadX: IBindingPayload = {
			bindingRule: {
				anchorSiteName: !far ? "here" : "far",
				targetSiteName: "here",
				dimension: "x"
			},
			anchorObject: col
		};
		var bottomBindingPayloadY: IBindingPayload = {
			bindingRule: {
				anchorSiteName: "far",
				targetSiteName: "far",
				dimension: "y"
			},
			anchorObject: ENGINE.handler.diagram.components.sequences[0]!
		};

		selectBind(topBindingPayloadX, topBindingPayloadY);
		selectBind(bottomBindingPayloadX, bottomBindingPayloadY);
	};

	const hoverPlaceVerticalLine = (col: Aligner<Visual>, far: boolean = false) => {
		var x = !far ? col.x : col.getFar("x");

		var topY = ENGINE.handler.diagram.components.sequences[0]!.contentY;
		var bottomY = ENGINE.handler.diagram.components.sequences[0]!.getFar("y", true);
		setColumnHovered(true);

		const p = new Path().attr({
			strokeWidth: props.config.lineStyle.thickness,
			stroke: props.config.lineStyle.stroke,
			d: `M ${x} ${topY} L ${x} ${bottomY}`,
			"stroke-dasharray": `${props.config.lineStyle.dashing[0]} ${props.config.lineStyle.dashing[1]}`
		});

		setArrowIndicator(p);
		setPreviewPathSvg(p.svg());
	};

	const selectBind = (bindX: IBindingPayload, bindY: IBindingPayload) => {
		if (start.current === undefined) {
			start.current = {x: bindX, y: bindY};
			var startX = bindX.anchorObject.getCoordinateFromBindRule(bindX.bindingRule);
			var startY = bindY.anchorObject.getCoordinateFromBindRule(bindY.bindingRule);
			setStartCoords([startX, startY]);

			const p = new Path().attr({
				"stroke-width": props.config.lineStyle.thickness,
				stroke: props.config.lineStyle.stroke,
				d: `M ${startX} ${startY} L ${startX} ${startY}`,
				"stroke-dasharray": `${props.config.lineStyle.dashing[0]} ${props.config.lineStyle.dashing[1]}`
			});

			setArrowIndicator(p);
			setPreviewPathSvg(p.svg());
		} else {
			end.current = {x: bindX, y: bindY};

			if (start.current !== undefined) {
				createArrow(start.current, {x: bindX, y: bindY});
			}

			start.current = undefined;
			end.current = undefined;
			setStartCoords(undefined);
			setArrowIndicator(undefined);
			setPreviewPathSvg(undefined);
		}
	};

	useEffect(() => {
		if (!startCoords || !arrowIndicator) {
			return;
		}

		const handleWindowMouseMove = (e: MouseEvent) => {
			const svg = overlaySvgRef.current;
			if (!svg) {
				return;
			}

			const point: DOMPoint = svg.createSVGPoint();
			point.x = e.clientX;
			point.y = e.clientY;
			const ctm: DOMMatrix | null = svg.getScreenCTM();
			if (ctm) {
				const inv: DOMMatrix = ctm.inverse();
				const loc: DOMPoint = point.matrixTransform(inv);
				arrowIndicator.attr({
					d: `M ${startCoords[0]} ${startCoords[1]} L ${loc.x} ${loc.y}`
				});
				setPreviewPathSvg(arrowIndicator.svg());
			} else {
				const rect: DOMRect = svg.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				arrowIndicator.attr({
					d: `M ${startCoords[0]} ${startCoords[1]} L ${x} ${y}`
				});
				setPreviewPathSvg(arrowIndicator.svg());
			}
		};

		window.addEventListener("mousemove", handleWindowMouseMove);
		return () => {
			window.removeEventListener("mousemove", handleWindowMouseMove);
		};
	}, [startCoords, arrowIndicator]);

	var columns = ENGINE.handler.diagram.components.sequences[0]!.components.pulseColumns.children;
	var lastColumn =
		ENGINE.handler.diagram.components.sequences[0]!.components.pulseColumns.children.at(-1);
	return (
		<>
			<div style={{position: "absolute"}}>
				{props.hoveredElement && props.config.mode === "bind" ? (
					<BindingsSelector
						element={props.hoveredElement}
						selectBind={selectBind}></BindingsSelector>
				) : (
					<></>
				)}

				{
					/* Create regions around pulse columns*/
					props.config.mode === "vertical" ? (
						<>
							{columns.map((col) => {
								return (
									<div
										style={{
											position: "absolute",
											backgroundColor: "transparent",
											width: "10px",
											height: ENGINE.handler.diagram.components.sequences[0]
												.height,
											left: col.x,
											top: 0,
											zIndex: 6000,
											transform: "translateX(-50%)"
										}}
										onClick={() => {
											placeVerticalLine(col);
										}}
										onMouseOver={() => {
											hoverPlaceVerticalLine(col);
										}}
										onMouseLeave={() => setColumnHovered(false)}></div>
								);
							})}

							{/* Far on last column*/}
							<div
								style={{
									position: "absolute",
									backgroundColor: "transparent",
									width: "10px",
									height: lastColumn.height,
									left: lastColumn.getFar("x"),
									top: 0,
									zIndex: 6000,
									transform: "translateX(-50%)"
								}}
								onClick={() => {
									placeVerticalLine(lastColumn, true);
								}}
								onMouseOver={() => {
									hoverPlaceVerticalLine(lastColumn, true);
								}}
								onMouseLeave={() => setColumnHovered(false)}></div>
						</>
					) : (
						<></>
					)
				}

				{(startCoords !== undefined || columnHovered) && previewPathSvg !== undefined ? (
					<svg
						key="annotation-preview-layer"
						ref={overlaySvgRef}
						style={{
							position: "absolute",
							left: 0,
							top: 0,
							pointerEvents: "none"
						}}
						width={ENGINE.handler.diagram.width}
						height={ENGINE.handler.diagram.height}>
						<g dangerouslySetInnerHTML={{__html: previewPathSvg}} />
					</svg>
				) : (
					<></>
				)}
			</div>
		</>
	);
}
