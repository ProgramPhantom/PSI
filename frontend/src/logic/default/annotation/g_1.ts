import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_G1: ILaTeX = {
	"ref": "annotation-g1",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "G_1",
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
