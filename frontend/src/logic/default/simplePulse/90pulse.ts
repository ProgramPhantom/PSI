import { IRectElement } from "../../rectElement"

export const DEFAULT_90H: IRectElement = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"contentWidth": 14,
	"contentHeight": 50,

	"pulseLayoutConfig": {
		"alignment": { "x": "centre", "y": "far" },
		"orientation": "top",
		"noSections": 1,
	},

	"pulseData": {
		"pulseType": { "category": "shape", "type": "Hard" }
	},

	"style": {
		"fill": "#000000",
		"stroke": "black",
		"strokeWidth": 0
	},

	"ref": "90-pulse",
	"type": "rect"
}

