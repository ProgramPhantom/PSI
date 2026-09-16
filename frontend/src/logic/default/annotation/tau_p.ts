import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_TAU_P: ILaTeX = {
	"ref": "tau-p",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "\\tau_\\text{p}",
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
