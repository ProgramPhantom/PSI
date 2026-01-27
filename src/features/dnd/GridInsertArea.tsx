import { Colors } from "@blueprintjs/core";
import { CSSProperties } from "react";
import { useDrop } from "react-dnd";
import { DragElementTypes, } from "./CanvasDropContainer";


export interface IGridArea {
	area: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	coords: { row: number, col: number },
	id: string
}

export interface IGridAreaResult {
	coords: { row: number, col: number }
	id: string
}
export type GridDropResultType = { type: "grid", data: IGridAreaResult }


function GridInsertArea(props: { areaSpec: IGridArea; key: string }) {
	const [{ canDrop, isOver }, drop] = useDrop(() => ({
		accept: [DragElementTypes.SUBSEQUENCE],
		drop: () =>
			({
				type: "grid",
				data: {
					coords: props.areaSpec.coords,
					id: props.areaSpec.id
				}
				
			}) as GridDropResultType,
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			isOverCurrent: monitor.isOver({ shallow: false }),
			canDrop: monitor.canDrop()
		})
	}));

	const isActive = canDrop && isOver;
	let backgroundColor = "transparent";
	let border = "2px solid rgba(0, 0, 0, 0)";
	if (isActive) {
		backgroundColor = Colors.RED2;
	} else if (canDrop) {
		backgroundColor = Colors.RED4;
		border = "2px solid rgba(80, 80, 80, 0)";
	}

	let style: CSSProperties = {
		height: `${props.areaSpec.area.height}px`,
		width: `${props.areaSpec.area.width}px`,

		backgroundColor: "transparent",
		visibility: canDrop ? "visible" : "hidden",
		position: "absolute",
		top: `${props.areaSpec.area.y}px`,
		left: `${props.areaSpec.area.x}px`,
		opacity: 0.4,
		zIndex: isActive ? 20000 : 200,
		border: "2px dashed rgba(80, 80, 80, 1)"
	};

	return (
		<div
			ref={drop}
			style={{ ...style, backgroundColor, pointerEvents: "visiblePainted", }}
			key={props.key}></div>
	);
}

export default GridInsertArea;
