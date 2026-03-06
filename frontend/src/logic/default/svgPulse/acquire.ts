import { ISVGElement } from "../../svgElement"

export const DEFAULT_ACQUIRE: ISVGElement = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"asset": { ref: "acquire", id: "builtin" },
	"contentWidth": 150,
	"contentHeight": 75,

	"pulseData": {
		"alignment": { "x": "centre", "y": "far" },
		"orientation": "both",
		"noSections": 1,
		"clipBar": true
	},

	"ref": "acquire",
	"style": {},
	"type": "svg"
}
