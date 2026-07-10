import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_DELTA_CAP: ILaTeX = {
	"ref": "annotation-delta-cap",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "\\Delta",
	"padding": [8, 8, 8, 8],
	"offset": [0, 0],

	"style": {
		"fontSize": 35,
		"colour": "black",
		"background": null,
		"display": "block"
	},

	"sizeMode": { x: "fit", y: "fit" },
	"type": "latex"
}
