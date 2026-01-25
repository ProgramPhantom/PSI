import { Colors } from "@blueprintjs/core";
import { CSSProperties } from "react";
import { useDrop } from "react-dnd";
import { ID } from "../../logic/point";
import { DragElementTypes } from "./CanvasDropContainer";
import { Orientation } from "../../logic/spacial";


export interface IPulseArea {
	area: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	channelID: ID;
	sequenceID: ID;
	index: number;
	orientation: Orientation;
	insert: boolean;
}

interface IPulseDataAreaResult {
	index: number;
	channelID: ID;
	sequenceID: ID;
	orientation: Orientation;
	insert: boolean;
}
export type PulseDropResultType = {type: "pulse", data: IPulseDataAreaResult}


function ChannelInsertArea(props: {areaSpec: IPulseArea; key: string}) {
	const [{canDrop, isOver}, drop] = useDrop(() => ({
		accept: [DragElementTypes.PULSE, DragElementTypes.PREFAB, DragElementTypes.FREE],
		drop: () =>
			({
				data: {
					index: props.areaSpec.index,
					channelID: props.areaSpec.channelID,
					sequenceID: props.areaSpec.sequenceID,
					insert: props.areaSpec.insert,
					orientation: props.areaSpec.orientation,
				},
				type: "pulse"
			}) as PulseDropResultType,
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			isOverCurrent: monitor.isOver({shallow: false}),
			canDrop: monitor.canDrop()
		})
	}));

	const isActive = canDrop && isOver;
	let backgroundColor = "transparent";
	let border = "2px solid rgba(0, 0, 0, 0)";
	if (isActive) {
		backgroundColor = Colors.BLUE3;
	} else if (canDrop) {
		backgroundColor = Colors.BLUE5;
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
		zIndex: isActive ? 20000 : 200
	};

	return (
		<div
			ref={drop}
			style={{...style, backgroundColor, pointerEvents: "visiblePainted",}}
			data-testid={props.areaSpec.channelID + props.areaSpec.index}
			key={props.key}></div>
	);
}

export default ChannelInsertArea;
