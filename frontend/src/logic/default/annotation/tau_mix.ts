import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_TAU_MIX: ILaTeX = {
	"ref": "annotation-tau-mix",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "\\tau_{\\text{mix}}",
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
