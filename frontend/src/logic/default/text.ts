import { IText } from "../text"

export const DEFAULT_TEXT: IText = {
	"ref": "default-text",
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
	"type": "text"
}
