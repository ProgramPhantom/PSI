import { ILaTeX } from "../latex"

export const DEFAULT_CHANNEL_TEXT: ILaTeX = {
	"ref": "channel-label",
	"contentWidth": 10,
	"contentHeight": 10,
	"placementControl": "auto",
	"text": "^{1}\\textrm{H}",
	"padding": [0, 5, 0, 0],
	"offset": [0, 0],

	"style": {
		"fontSize": 45,
		"colour": "black",
		"background": null,
		"display": "block"
	},

	"sizeMode": { x: "fit", y: "fit" },
	"type": "latex",
	"role": "label"
}
