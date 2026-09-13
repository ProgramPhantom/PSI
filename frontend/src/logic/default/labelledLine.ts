import { ILabelledLine } from "../hasComponents/labelledLine";
import { ILaTeX } from "../latex";
import { ILine } from "../line";
import { DEFAULT_LINE } from "./line";

export const DEFAULT_LABELLED_LINE: ILabelledLine = {
	offset: [0, 0],
	padding: [0, 0, 0, 0],
	sizeMode: { x: "fit", y: "fit" },
	placementMode: { type: "free" },
	ref: "labelled-line",
	textPosition: "centre",
	type: "labelled-line",
	children: [
		{
			...DEFAULT_LINE,
			placementMode: { type: "free" },
			startX: 0,
			startY: 0,
			endX: 100,
			endY: 0,
			role: "line"
		} as ILine,
		{
			contentWidth: 10,
			contentHeight: 10,
			text: "t_0",
			padding: [0, 0, 0, 0],
			offset: [0, 0],
			style: {
				fontSize: 10,
				colour: "black",
				background: null,
				display: "block"
			},
			ref: "labelled-line-text",
			type: "latex",
			role: "text"
		} as ILaTeX
	]
};
