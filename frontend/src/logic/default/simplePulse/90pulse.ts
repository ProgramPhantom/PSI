import { IRectElement } from "../../rectElement"

export const DEFAULT_90H: IRectElement = {
	"padding": [0, 4, 0, 4],
	"offset": [0, 0],
	"contentWidth": 14,
	"contentHeight": 100,

	"pulseData": {
		"alignment": { "x": "centre", "y": "far" },
		"orientation": "top",
		"noSections": 1,
	},

	"style": {
		"fill": "#000000",
		"stroke": "black",
		"strokeWidth": 0
	},

	"ref": "90-pulse",
	"type": "rect"
}

