import {CSSProperties} from "react";
import {useDrop} from "react-dnd";
import {Orientation} from "../../logic/mountable";
import {ID} from "../../logic/point";
import {IDrop} from "./CanvasDropContainer";
import {ElementTypes} from "./TemplateDraggableElement";
import { Colors } from "@blueprintjs/core";

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface AddSpec {
	area: Rect;
	channelID: ID;
	sequenceID: ID;
	index: number;
	orientation: Orientation;
	insert: boolean;
}

export interface IMountAreaResult extends IDrop {
	index: number;
	channelID: ID;
	sequenceID: ID;
	orientation: Orientation;
	insert: boolean;
}

export function isMountDrop(object: IDrop): object is IMountAreaResult {
	return object.dropEffect === "insert";
}

function InsertArea(props: {areaSpec: AddSpec; key: string}) {
	const [{canDrop, isOver}, drop] = useDrop(() => ({
		accept: [ElementTypes.PREFAB, ElementTypes.CANVAS_ELEMENT],
		drop: () =>
			({
				index: props.areaSpec.index,
				channelID: props.areaSpec.channelID,
				sequenceID: props.areaSpec.sequenceID,
				insert: props.areaSpec.insert,
				orientation: props.areaSpec.orientation,
				dropEffect: "insert"
			}) as IMountAreaResult,
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
		position: "absolute",
		top: `${props.areaSpec.area.y}px`,
		left: `${props.areaSpec.area.x}px`,
		opacity: 0.4,
		zIndex: isActive ? 20000 : 200
	};

	return (
		<div
			ref={drop}
			style={{...style, backgroundColor}}
			data-testid={props.areaSpec.channelID + props.areaSpec.index}
			key={props.key}></div>
	);
}

export default InsertArea;
