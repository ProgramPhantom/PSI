import { ILabel } from "../hasComponents/label";
import { DEFAULT_LINE } from "./line";

export const DEFAULT_LABEL: ILabel = {
	"offset": [0, 0],
	"padding": [0, 0, 0, 0],
	"sizeMode": {x: "fit", y: "fit"},
	"mainAxis": "x",

	"text": {
		"contentWidth": 10,
		"contentHeight": 10,

		"text": "\\textrm{H}",
		"padding": [0, 0, 2, 0],
		"offset": [0, 0],

		"style": {
			"fontSize": 15,
			"colour": "black",
			"background": null,
			"display": "block"
		},
		"ref": "label-text",
		"type": "text"
	},

	"line": DEFAULT_LINE,
	"placementMode": { "type": "free" },
	"ref": "label",

	"labelConfig": {
		"textPosition": "bottom"
	},
	"children": [],
	"type": "label"
}