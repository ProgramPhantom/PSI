import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_G2: ILaTeX = {
	"ref": "annotation-g2",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "G_2",
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
