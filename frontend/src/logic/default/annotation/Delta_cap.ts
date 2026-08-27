import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_DELTA_CAP: ILaTeX = {
	"ref": "Delta-cap",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "\\Delta",
	"padding": [8, 8, 8, 8],
	"offset": [0, 0],

	"style": {
		"fontSize": 10,
		"colour": "black",
		"background": null,
		"display": "block"
	},

	"sizeMode": { x: "fit", y: "fit" },
	"type": "latex"
}
