import { ILaTeX } from "../../latex"

export const DEFAULT_ANNOTATION_PHI_REC: ILaTeX = {
	"ref": "phi-rec",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "\\Phi_\\text{rec.}",
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
