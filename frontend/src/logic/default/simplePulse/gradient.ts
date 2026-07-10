import { IRectElement } from "../../rectElement"

export const DEFAULT_GRADIENT: IRectElement = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"contentWidth": 150,
	"contentHeight": 15,

	"pulseLayoutConfig": {
		"alignment": { "x": "centre", "y": "far" },
		"orientation": "top",
		"noSections": 1,
	},

	"pulseData": {
		"pulseType": { "category": "PFG" }
	},

	"style": {
		"fill": "#000000",
		"stroke": "black",
		"strokeWidth": 0
	},

	"ref": "gradient",
	"type": "rect"
}

