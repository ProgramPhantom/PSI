import { IRectElement } from "../../rectElement"

export const DEFAULT_180H: IRectElement = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],

	"contentWidth": 20,
	"contentHeight": 50,

	"pulseLayoutConfig": {
		"alignment": { "x": "centre", "y": "far" },
		"orientation": "top",
		"noSections": 1,
	},

	"style": {
		"fill": "#000000",
		"stroke": "black",
		"strokeWidth": 0
	},

	"ref": "180-pulse",
	"type": "rect"
}

