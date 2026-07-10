import { Button } from "@blueprintjs/core";
import "@svgdotjs/svg.draggable.js";
import { Element } from "@svgdotjs/svg.js";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { appToaster } from "../../app/Toaster";
import { ClearIDs } from "../../logic/collection";
import ENGINE from "../../logic/engine";
import { Subgrid } from "../../logic/grid";
import Visual, { IVisual } from "../../logic/visual";
import LabelGroup, { ILabelGroup } from "../../logic/hasComponents/labelGroup";
import { useAppDispatch } from "../../redux/hooks";
import { InternalSchemeId } from "../../redux/slices/schemesSlice";
import { deleteComponentThunk } from "../../redux/thunks/schemeThunks";
import { AllDropResultTypes, DragElementTypes } from "./CanvasDropContainer";


const style: CSSProperties = {
	border: "1px solid #d3d8de",
	backgroundColor: "white",
	padding: "12px 8px",
	marginRight: "0.5rem",
	marginBottom: "0.5rem",
	cursor: "move",
	float: "left",
	width: "100px",
	height: "60px",
	borderRadius: "4px",
	boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
	transition: "all 0.2s ease",
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center"
};




interface ITemplateDraggableElementProps {
	element: Visual;
	onDoubleClick?: (element: Visual) => void;
	schemeId: string;
	templateId: string;
}

export interface IDraggableElementDropItem {
	element: Visual;
}

/* When an element is selected, the svg on the canvas is hidden and the element is replaced
by this. It is a different object that can be dragged. */
const TemplateDraggableElement: React.FC<ITemplateDraggableElementProps> = (props) => {
	const dispatch = useAppDispatch();

	// Compute drag element type:
	let dragElementType = DragElementTypes.ATOMIC_PREFAB;
	if (props.element instanceof Subgrid) {
		dragElementType = DragElementTypes.SUBGRID
	}

	const [{ isDragging }, drag, preview] = useDrag(() => ({
		type: dragElementType,
		item: { element: props.element } as IDraggableElementDropItem,
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult<AllDropResultTypes>();

			if (dropResult === null) {
				return;
			}

			var singletonState: IVisual = structuredClone(props.element.state);

			ClearIDs(singletonState)  // Required

			switch (dropResult.type) {
				case "canvas":
					singletonState.x = dropResult.data.x;
					singletonState.y = dropResult.data.y;

					singletonState.placementMode = {
						type: "free"
					}
					singletonState.parentId = ENGINE.handler.diagram.id;

					ENGINE.handler.act({
						"type": "add",
						input: {
							child: singletonState,
						}
					})
					break;
				case "pulse": {
					const orientation = singletonState.pulseLayoutConfig?.orientation !== "both" ? dropResult.data.orientation : "both";
					const yAlign = orientation === "bottom" ? "here" : orientation === "both" ? "centre" : "far";
					singletonState.pulseLayoutConfig = {
						channelID: dropResult.data.channelID,
						sequenceID: dropResult.data.sequenceID,
						index: dropResult.data.index,

						orientation: orientation,
						alignment: {
							x: singletonState.pulseLayoutConfig?.alignment?.x ?? "centre",
							y: yAlign
						},
						noSections: singletonState.pulseLayoutConfig?.noSections ?? 1,
						clipBar: singletonState.pulseLayoutConfig?.clipBar ?? false,

					}

					singletonState.parentId = dropResult.data.channelID;

					singletonState.placementMode = {
						type: "grid",
						config: {}
					}

					singletonState.flipped = singletonState.pulseLayoutConfig.orientation === "bottom" ? true : false

					if (dropResult.data.insert === true) {
						ENGINE.handler.addColumn(dropResult.data.sequenceID ?? "", dropResult.data.index);
					}

					ENGINE.handler.act({
						type: "add",
						input: {
							child: singletonState,
						}
					})
				}
					break;
				case "grid":
					singletonState.placementMode = {
						type: "subgrid",
						config: {
							coords: dropResult.data.coords
						}
					}
					singletonState.parentId = dropResult.data.id;

					ENGINE.handler.act({
						"type": "add",
						"input": {
							child: singletonState
						}
					})
					break;
				case "labelGroup":
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
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
			handlerId: monitor.getHandlerId()
		})
	}));
	const [showBin, setShowBin] = useState<boolean>(false);
	const opacity = isDragging ? 0.5 : 1;

	// Get visual
	const element = useRef<Element>(props.element.getInternalRepresentation()!)
	var visualRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		if (visualRef.current) {
			visualRef.current.appendChild(element.current.node);
			visualRef.current.setAttribute("width", props.element.contentWidth.toString())
			visualRef.current.setAttribute("height", props.element.contentHeight.toString())
		}
	}, [props.element]);


	useEffect(() => {
		preview(getEmptyImage(), { captureDraggingState: true });
	}, []);

	const handleDoubleClick = () => {
		if (props.onDoubleClick) {
			props.onDoubleClick(props.element);
		}
	};

	const deleteTemplate = () => {
		dispatch(deleteComponentThunk({ schemeId: props.schemeId, templateId: props.templateId }));

		appToaster.show({
			"message": `Deleted ${props.element.ref}`,
			"intent": "success"
		})
	}

	return (
		<div
			ref={drag}
			style={{
				position: "relative",
				width: "120px",
				height: "120px",
				padding: "12px 8px",
				border: "1px solid #d3d8de",
				borderRadius: "4px",
				backgroundColor: "white",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				opacity: opacity,
				cursor: "grab",
				boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
				transition: "all 0.2s ease",
				userSelect: "none"
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
				e.currentTarget.style.transform = "translateY(-1px)";
				setShowBin(true);
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
				e.currentTarget.style.transform = "translateY(0)";
				setShowBin(false);
			}}
			onDoubleClick={handleDoubleClick}
			title={`Drag ${props.element.ref} to canvas`}>
			{props.schemeId !== InternalSchemeId ? (
				<Button
					title={`Delete ${props.element.ref}`}
					icon="trash"
					style={{
						position: "absolute",
						top: 1,
						left: 1,
						zIndex: 10,
						visibility: showBin ? "visible" : "hidden"
					}}
					onClick={() => deleteTemplate()}
					variant="minimal"
					intent="danger"></Button>
			) : (
				<></>
			)}

			<div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
				<svg ref={visualRef}
					style={{ overflow: "scroll" }}></svg>
			</div>


			<span
				style={{
					fontSize: "12px",
					color: "#5c7080",
					fontWeight: "600",
					textAlign: "center",
					lineHeight: "1.4",
					marginTop: "auto"
				}}>
				{props.element.ref}
			</span>
		</div>
	);
};

export default TemplateDraggableElement;
