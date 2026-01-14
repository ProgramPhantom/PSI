import { IText } from "../text"

export const DEFAULT_TEXT: IText = {
	"ref": "default-text",
	"contentWidth": 10,
	"contentHeight": 10,
	"placementControl": "auto",
	"text": "^{1}\\textrm{H}",
	"padding": [0, 5, 0, 0],
	"offset": [0, 0],

	"style": {
		"fontSize": 55,
		"colour": "black",
		"background": null,
		"display": "block"
	},

	"sizeMode": { x: "fit", y: "fit" },
	"type": "text"
}
