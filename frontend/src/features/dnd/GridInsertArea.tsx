import { Colors } from "@blueprintjs/core";
import { CSSProperties, useEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import { DragElementTypes, } from "./CanvasDropContainer";
import { IDraggableElementDropItem } from "./TemplateDraggableElement";
import { IVisual } from "../../logic/visual";


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


interface IGridInsertAreaProps {
	areaSpec: IGridArea;
	isHighlighted?: boolean;
	onSetHighlights?: (cells: Set<string>) => void;
}

function GridInsertArea(props: IGridInsertAreaProps) {
	const [{ canDrop, isOver }, drop] = useDrop(() => ({
		accept: [DragElementTypes.SUBGRID],
		drop: () =>
			({
				type: "grid",
				data: {
					coords: props.areaSpec.coords,
					id: props.areaSpec.id
				}

			}) as GridDropResultType,
		hover: (item: any, monitor) => {
			if (monitor.canDrop() && props.onSetHighlights) {
				const numRows: number = item.element?.numRows ?? 1;
				const numCols: number = item.element?.numCols ?? 1;
				const coords = props.areaSpec.coords;

				const newHighlights = new Set<string>();
				for (let r = 0; r < numRows; r++) {
					for (let c = 0; c < numCols; c++) {
						newHighlights.add(`${coords.row + r},${coords.col + c}`);
					}
				}

				props.onSetHighlights(newHighlights);
			}
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			isOverCurrent: monitor.isOver({ shallow: false }),
			canDrop: monitor.canDrop()
		}),

	})); // Added dependencies


	useEffect(() => {
		if (!isOver && props.onSetHighlights) {
			props.onSetHighlights(new Set());
		}
	}, [isOver]);

	const isActive = canDrop && isOver;
	let backgroundColor = "transparent";
	/*
	let border = "2px solid rgba(0, 0, 0, 0)"; // Unused variable
	*/

	if (isActive || props.isHighlighted) {
		backgroundColor = Colors.RED2;
	} else if (canDrop) {
		backgroundColor = Colors.RED4;
		// border = "2px solid rgba(80, 80, 80, 0)";
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
		></div>
	);
}

export default GridInsertArea;
