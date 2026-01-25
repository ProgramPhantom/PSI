import { Colors } from "@blueprintjs/core";
import "@svgdotjs/svg.draggable.js";
import React, { CSSProperties, memo, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { HandleStyles } from "react-rnd";
import ENGINE from "../../logic/engine";
import { isPulse } from "../../logic/spacial";
import Visual, { IVisual } from "../../logic/visual";
import { AllDropResultTypes, DragElementTypes } from "./CanvasDropContainer";
import { ActionResult } from "../../logic/diagramHandler";
import { appToaster } from "../../app/Toaster";


const style: CSSProperties = {
	border: "1px dashed gray",
	backgroundColor: "white",
	padding: "0.5rem 1rem",
	marginRight: "1.5rem",
	marginBottom: "1.5rem",
	cursor: "move",
	float: "left",
	width: "100px",
	height: "30px"
};

const handleStyle: React.CSSProperties = {
	width: "2px",
	height: "2px",
	borderRadius: "50%",
	borderColor: "#a7acb0",
	borderWidth: "1px",
	borderStyle: "solid",
	backgroundColor: "white",

	display: "inline-block",
	transform: "translate(-50%, -50%)",
	transformOrigin: "top left"
};

const hStyle: HandleStyles = {
	topLeft: { ...handleStyle, left: 0, top: 0 },
	top: { ...handleStyle, left: "50%", top: 0 },
	topRight: { ...handleStyle, left: "100%", top: 0 },
	left: { ...handleStyle, left: 0, top: "50%" },
	right: { ...handleStyle, left: "100%", top: "50%" },
	bottomLeft: { ...handleStyle, left: 0, top: "100%" },
	bottom: { ...handleStyle, left: "50%", top: "100%" },
	bottomRight: { ...handleStyle, left: "100%", top: "100%" }
};

interface IDraggableElementProps {
	name: string;
	element: Visual;
	x: number;
	y: number;

	reselect: (e: Visual) => void
}

export interface CanvasDraggableElementPayload {
	element: Visual;
	offset?: { x: number, y: number };
}

/* When an element on the canvas is selected, it is replaced by this, a draggable element */
const CanvasDraggableElement: React.FC<IDraggableElementProps> = memo(
	function CanvasDraggableElement(props: IDraggableElementProps) {
		const offsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

		// Compute drag element type:
		let dragElementType = DragElementTypes.OTHER;
		if (isPulse(props.element)) {
			dragElementType = DragElementTypes.PULSE
		} else if (props.element.placementControl === "auto") {
			dragElementType = DragElementTypes.FIXED;
		} else if (props.element.placementMode.type === "free") {
			dragElementType = DragElementTypes.FREE
		}

		const [{ isDragging }, drag, preview] = useDrag(
			() => ({
				type: dragElementType,
				item: () => ({
					element: props.element,
					offset: offsetRef.current
				} as CanvasDraggableElementPayload),
				end: (item, monitor) => {
					const dropResult = monitor.getDropResult<AllDropResultTypes>();
					if (dropResult === null) {
						return;
					}

					let newState: IVisual = { ...item.element.state }

					switch (dropResult.type) {
						case "canvas":
							const scale = ENGINE.surface.node.getScreenCTM()?.a ?? 1;

							const offsetX = item.offset?.x ?? 0;
							const offsetY = item.offset?.y ?? 0;

							
							newState.x = dropResult.data.x - (offsetX / scale);
							newState.y = dropResult.data.y - (offsetY / scale);

							
							newState.parentId = ENGINE.handler.diagram.id;
							newState.placementMode = {
								type: "free",
							}

							ENGINE.handler.act({
								type: "createAndModify",
								input: {
									parameters: newState,
									target: props.element
								}
							})
							break;
						case "pulse":
							newState.pulseData = {
								channelID: dropResult.data.channelID,
								sequenceID: dropResult.data.sequenceID,
								index: dropResult.data.index,

								orientation: newState.pulseData?.orientation !== "both" ? dropResult.data.orientation : "both",
								alignment: newState.pulseData?.alignment ?? {x: "centre", y: "far"},
								noSections: newState.pulseData?.noSections ?? 1,
								clipBar: newState.pulseData?.clipBar ?? false
							}

							newState.parentId = dropResult.data.channelID;
							
							newState.placementMode = {
								type: "grid",
								config: {}
							}

							if (dropResult.data.insert === true) {
								ENGINE.handler.addColumn(dropResult.data.sequenceID ?? "", dropResult.data.index);
							}

							ENGINE.handler.act({
								type: "createAndModify",
								input: {
									parameters: newState,
									target: props.element
								}
							})
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
					}
				},
				collect: (monitor) => ({
					isDragging: monitor.isDragging(),
					handlerId: monitor.getHandlerId()
				})
			}),
			[props.x, props.y, props.name]
		);

		var visualRef = useRef<SVGSVGElement | null>(null);
		var visual = props.element.getInternalRepresentation()!.show();

		// Removed the default preview?
		useEffect(() => {
			preview(getEmptyImage(), { captureDraggingState: true });
		}, []);

		useEffect(() => {
			if (visualRef.current) {
				visualRef.current.appendChild(visual.node);
			}
		}, [props.element]);

		return (
			<>
				{
    		/* <Rnd disableDragging={true} resizeHandleStyles={hStyle}>
    		<svg ref={visualRef}></svg>
      </Rnd> */}
				<div key={dragElementType}
					style={{
						zIndex: 15000,
						opacity: isDragging ? 0.4 : 1,
						position: "relative"
					}}>
					<div
						ref={drag}
						onMouseDown={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							offsetRef.current = {
								x: e.clientX - rect.left,
								y: e.clientY - rect.top
							};
						}}
						style={{
							height: props.element.contentHeight,
							width: props.element.contentWidth
						}}>
						{/* Border */}
						<svg
							style={{
								width: "100%",
								height: "100%",
								position: "absolute",
								top: 0,
								left: 0,
								overflow: "visible"
							}}>
							{props.element.padding.some((v) => v > 0) ? (
								<rect
									x={-props.element.padding[3]} // Left padding
									y={-props.element.padding[0]} // Top padding
									width={props.element.width}
									height={props.element.height}
									style={{
										stroke: isDragging ? `none` : `${Colors.GRAY3}`,
										strokeWidth: "1px",
										fill: `${Colors.GRAY5}`,
										fillOpacity: "10%",
										strokeDasharray: "2 2"
									}}></rect>
							) : (
								<></>
							)}
							<svg ref={visualRef}></svg>
							<rect
								style={{
									stroke: isDragging ? `none` : `${Colors.BLUE3}`,
									width: "100%",
									height: "100%",
									strokeWidth: "1px",
									fill: `${Colors.BLUE5}`,
									fillOpacity: "10%",
									strokeDasharray: "1 1"
								}}></rect>
						</svg>
					</div>
				</div>
			</>
		);
	}
);

export default CanvasDraggableElement;
