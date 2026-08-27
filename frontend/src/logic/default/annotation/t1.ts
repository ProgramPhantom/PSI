import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_T1: ILaTeX = {
	"ref": "t1",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "t_1",
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
