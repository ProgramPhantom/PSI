import { ILabel } from "../../hasComponents/label";
import { ILaTeX } from "../../latex";
import { DEFAULT_LINE } from "../line";

export const DEFAULT_ANNOTATION_LABEL_DELTA_CAP: ILabel = {
	"offset": [0, 0],
	"padding": [0, 0, 0, 0],
	"sizeMode": { x: "grow", y: "fit" },
	"mainAxis": "y",

	"placementMode": { "type": "free" },
	"ref": "label-Delta",

	"labelConfig": {
		"textPosition": "top"
	},
	"children": [
		{
			"contentWidth": 10,
			"contentHeight": 10,

			"text": "\\Delta",
			"padding": [0, 0, 5, 0],
			"offset": [0, 0],

			"style": {
				"fontSize": 10,
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
