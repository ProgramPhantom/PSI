import { CSSProperties } from "react";
import { isPulse } from "../../logic/spacial";
import Grid from "../../logic/grid";
import Visual from "../../logic/visual";
import GridDebug from "./GridDebug";
import PaddedBoxDebug from "./PaddedBoxDebug";

export interface IPulseDebug {
	element: Visual;
	contentColour?: string;
	padColour?: string;
}

var globalStyle: CSSProperties = {
	position: "absolute",
	pointerEvents: "none"
};

const PulseDebug: React.FC<IPulseDebug> = (props) => {
	var paddingStyle: CSSProperties = {
		background: props.padColour ? props.padColour : "grey",
		opacity: 0.5,

		...globalStyle
	};

	var contentStyle: CSSProperties = {
		background: props.contentColour ? props.contentColour : "red",
		opacity: 0.7,

		...globalStyle
	};

	var boundaryStyle: CSSProperties = {
		border: "dashed",
		strokeOpacity: 1,
		borderWidth: "1px",
		opacity: 0.4,
		fill: "none",
		...globalStyle
	};

	var x1 = props.element.x;
	var y1 = props.element.y;
	var cx = props.element.cx;
	var cy = props.element.cy;

	var width = props.element.width;
	var height = props.element.height;

	var contentWidth = props.element.contentWidth !== undefined ? props.element.contentWidth : 0;
	var contentHeight = props.element.contentHeight !== undefined ? props.element.contentHeight : 0;

	var padding = props.element.padding;

	if (!isPulse(props.element)) {
		return <></>
	}

	let debugElement: JSX.Element = <></>;

	switch ((props.element.constructor as typeof Visual).ElementType) {
		case "rect":
		case "svg":
			debugElement = <PaddedBoxDebug element={props.element} />;
			break;
		case "label-group":
			debugElement = <GridDebug element={props.element as Grid} />;
			break;
		default:
			debugElement = <></>;
	}

	return <>{debugElement}</>;
};

export default PulseDebug;
