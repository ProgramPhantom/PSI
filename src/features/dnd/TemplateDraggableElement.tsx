import { Button } from "@blueprintjs/core";
import "@svgdotjs/svg.draggable.js";
import React, { CSSProperties, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import SchemeManager from "../../logic/default";
import { Result } from "../../logic/diagramHandler";
import ENGINE from "../../logic/engine";
import { ILabelGroup } from "../../logic/hasComponents/labelGroup";
import { AllComponentTypes, UserComponentType } from "../../logic/point";
import { IRectElement } from "../../logic/rectElement";
import { ISVGElement } from "../../logic/svgElement";
import Visual, { IVisual } from "../../logic/visual";
import { IDrop, isCanvasDrop } from "./CanvasDropContainer";
import { isMountDrop } from "./InsertArea";
import { IMountConfig } from "../../logic/spacial";
import { appToaster } from "../../app/Toaster";

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

export const ElementTypes = {
	PREFAB: "pulse",
	CANVAS_ELEMENT: "real_element"
};

interface ITemplateDraggableElementProps {
	element: Visual;
	onDoubleClick?: (element: Visual) => void;
	schemeName: string;
}

interface IDraggableElementDropItem {
	element: Visual;
}

/* When an element is selected, the svg on the canvas is hidden and the element is replaced
by this. It is a different object that can be dragged. */
const TemplateDraggableElement: React.FC<ITemplateDraggableElementProps> = (props) => {
	const [{isDragging}, drag, preview] = useDrag(() => ({
		type: ElementTypes.PREFAB,
		item: {element: props.element} as IDraggableElementDropItem,
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult<IDrop>();

			if (dropResult === null) {
				return;
			}

			if (isCanvasDrop(dropResult)) {
				return;
				// console.log(`Adding element at ${dropResult.x}, ${dropResult.y}`)
				//
				// ENGINE.handler.addElementFromTemplate({x: dropResult.x, y: dropResult.y}, props.element.ref);
			} else if (isMountDrop(dropResult)) {
				// ENGINE.handler.mountElementFromTemplate({mountConfig: {...dropResult}}, props.element.ref, dropResult.insert);
				var elementType = (props.element.constructor as typeof Visual).ElementType;
				var singletonState: IVisual = structuredClone(props.element.state);
				 
				if (singletonState.placementMode.type === "pulse") {
					let internalConfig: IMountConfig = singletonState.placementMode.config;
					
					singletonState.id = undefined;
					singletonState.placementMode = {
						type: "pulse",
						config: {
							alignment: internalConfig.alignment,
							noSections: internalConfig.noSections,
							
							orientation: dropResult.orientation,
							channelID: dropResult.channelID,
							sequenceID: dropResult.sequenceID,
							index: dropResult.index
						}
					}; 
				} else {
					throw new Error(`Prefabs must have placement type of pulse currently.`)
				}

				var result: Result<Visual> = ENGINE.handler.addVisual(
					singletonState,
					elementType as UserComponentType
				);

				if (result.ok === false) {
					appToaster.show({
						message: `Cannot mount pulse ${singletonState.ref}`,
						intent: "danger"
					});
				}
			}

			ENGINE.handler.draw();
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
			handlerId: monitor.getHandlerId()
		})
	}));
	const [showBin, setShowBin] = useState<boolean>(false);

	var elementType: AllComponentTypes = (props.element.constructor as typeof Visual).ElementType;

	// Get visual
	var copy = props.element.getInternalRepresentation();
	// copy?.x(0);
	// copy?.y(0);
	// copy?.show();
	// if (copy) {
	//   copy.draggable(true)
	// }

	const opacity = isDragging ? 0.5 : 1;

	useEffect(() => {
		preview(getEmptyImage(), {captureDraggingState: true});
	}, []);

	const handleDoubleClick = () => {
		if (props.onDoubleClick) {
			props.onDoubleClick(props.element);
		}
	};

	function deleteTemplate() {
		switch (elementType) {
			case "svg":
				ENGINE.removeSVGSingleton(props.element.state as ISVGElement, props.schemeName);
				break;
			case "rect":
				ENGINE.removeRectSingleton(props.element.state as IRectElement, props.schemeName);
				break;
			case "label-group":
				ENGINE.removeLabelGroupSingleton(
					props.element.state as ILabelGroup,
					props.schemeName
				);
				break;
		}
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
			{props.schemeName !== SchemeManager.InternalSchemeName ? (
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

			<svg
				style={{
					width: props.element.contentWidth,
					height: props.element.contentHeight,
					maxWidth: "90%",
					maxHeight: "90%",
					marginBottom: "auto",
					marginTop: "auto"
				}}
				dangerouslySetInnerHTML={{__html: copy?.svg()!}}
			/>
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
