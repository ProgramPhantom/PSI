import { Colors } from "@blueprintjs/core";
import "@svgdotjs/svg.draggable.js";
import React, { CSSProperties, memo, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { HandleStyles } from "react-rnd";
import ENGINE from "../../logic/engine";
import { IPulseConfig, isPulse } from "../../logic/spacial";
import Visual, { IVisual } from "../../logic/visual";
import { IDrop, isCanvasDrop } from "./CanvasDropContainer";
import { IMountAreaResult, isMountDrop } from "./InsertArea";
import { ElementTypes } from "./TemplateDraggableElement";


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
}

/* When an element on the canvas is selected, it is replaced by this, a draggable element */
const CanvasDraggableElement: React.FC<IDraggableElementProps> = memo(
	function CanvasDraggableElement(props: IDraggableElementProps) {
		const [{ isDragging }, drag, preview] = useDrag(
			() => ({
				type: ElementTypes.CANVAS_ELEMENT,
				item: { element: props.element } as CanvasDraggableElementPayload,
				end: (item, monitor) => {
					const dropResult = monitor.getDropResult<IDrop>();
					if (dropResult === null) {
						return;
					}

					if (isCanvasDrop(dropResult)) {
						// ENGINE.handler.moveElement(item.element, dropResult.x, dropResult.y);
					} else if (isMountDrop(dropResult)) {
						var result = dropResult as IMountAreaResult;
						let elementType = (item.element.constructor as typeof Visual).ElementType

						if (isPulse(item.element)) {
							// var newMountConfig: IPulseConfig = {
							// 	...item.element.placementMode.config,
							// 	orientation: item.element.placementMode.config.orientation === "both" ? "both" : result.orientation,
							// 	channelID: result.channelID,
							// 	sequenceID: result.sequenceID,
							// 	index: result.index
							// };

							let newState: IVisual = { ...item.element.state }

							if (dropResult.insert === true) {
								ENGINE.handler.addColumn(dropResult.sequenceID ?? "", dropResult.index);
							}

							if (isPulse(newState)) {
								newState.pulseData.channelID = dropResult.channelID;
								newState.pulseData.sequenceID = dropResult.sequenceID;
								newState.pulseData.index = dropResult.index;
							}

							let modifyResult = ENGINE.handler.submitModifyVisual(newState, elementType, item.element);

							if (modifyResult.ok === true) {
								props.reselect(modifyResult.value);
							}

						} else {
							throw Error("Not yet implemented"); // Converting an unmounted object into a mounted one.
						}
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
				<div
					style={{
						zIndex: 15000,
						opacity: isDragging ? 0.4 : 1,
						position: "relative"
					}}>
					<div
						ref={drag}
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
