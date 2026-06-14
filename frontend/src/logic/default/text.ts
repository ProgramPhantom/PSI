import { IText } from "../text";

export const DEFAULT_TEXT: IText = {
	"ref": "default-text",
	"contentWidth": 10,
	"contentHeight": 10,
	"text": "Text",
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],

	"style": {
		"fontSize": 20,
		"colour": "black",
		"background": null,
		"display": "block"
	},

	"sizeMode": { x: "fit", y: "fit" },
	"type": "text",
	"fontFamily": "sans-serif"
}
