import { ILaTeX } from "../latex"

export const DEFAULT_LATEX: ILaTeX = {
	"ref": "default-latex",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "^{1}\\textrm{H}",
	"padding": [0, 0, 0, 0],
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
