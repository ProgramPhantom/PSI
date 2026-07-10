import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_T1_HALF: ILaTeX = {
	"ref": "annotation-t1-half",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "\\frac{t_1}{2}",
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
