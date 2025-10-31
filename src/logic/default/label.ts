import { ILabel } from "../hasComponents/label";

export const DEFAULT_LABEL: ILabel = {
	"contentWidth": 0,
	"contentHeight": 0,

	"offset": [0, 0],
	"padding": [0, 0, 0, 0],

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
		"placementMode": {"type": "managed"}
	},

	"line": null,
	"placementMode": {"type": "free", "sizeMode": "fixed"},
	"ref": "label",

	"labelConfig": {
		"labelPosition": "top",
		"textPosition": "bottom"
	},
	"children": []
}