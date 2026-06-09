import { ILabel } from "../hasComponents/label";
import { IText } from "../text";
import { DEFAULT_LINE } from "./line";

export const DEFAULT_LABEL: ILabel = {
	"offset": [0, 0],
	"padding": [0, 0, 2, 0],
	"sizeMode": { x: "fit", y: "fit" },
	"mainAxis": "x",

	"placementMode": { "type": "free" },
	"ref": "label",

	"labelConfig": {
		"textPosition": "top"
	},
	"children": [
		{
			"contentWidth": 10,
			"contentHeight": 10,

			"text": "t_0",
			"padding": [0, 0, 2, 0],
			"offset": [0, 0],

			"style": {
				"fontSize": 15,
				"colour": "black",
				"background": null,
				"display": "block"
			},
			"ref": "label-text",
			"type": "text",
			"role": "text"
		} as IText,
		{
			...DEFAULT_LINE,
			"role": "line"
		}
	],
	"type": "label"
}