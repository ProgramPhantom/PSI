import { IRectElement } from "../../rectElement"

export const DEFAULT_180H: IRectElement = {
	"padding": [0, 4, 0, 4],
	"offset": [0, 0],

	"contentWidth": 10,
	"contentHeight": 40,

	"pulseData": {
		"alignment": { "x": "centre", "y": "far" },
		"orientation": "top",
		"noSections": 1,
	},

	"style": {
		"fill": "#ffffff",
		"stroke": "black",
		"strokeWidth": 1
	},

	"ref": "180-pulse",
	"type": "rect"
}

