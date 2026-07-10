import { ILabel } from "../../hasComponents/label";
import { ILaTeX } from "../../latex";
import { DEFAULT_LINE } from "../line";

export const DEFAULT_ANNOTATION_LABEL_DELTA: ILabel = {
	"offset": [0, 0],
	"padding": [8, 8, 8, 8],
	"sizeMode": { x: "fit", y: "fit" },
	"mainAxis": "y",

	"placementMode": { "type": "free" },
	"ref": "annotation-label-delta",

	"labelConfig": {
		"textPosition": "top"
	},
	"children": [
		{
			"contentWidth": 10,
			"contentHeight": 10,

			"text": "\\delta",
			"padding": [0, 0, 2, 0],
			"offset": [0, 0],

			"style": {
				"fontSize": 25,
				"colour": "black",
				"background": null,
				"display": "block"
			},
			"ref": "label-text",
			"type": "latex",
			"role": "text"
		} as ILaTeX,
		{
			...DEFAULT_LINE,
			"role": "line"
		}
	],
	"type": "label"
}
