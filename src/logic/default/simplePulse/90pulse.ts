import { IRectElement } from "../../rectElement"

export const DEFAULT_90H: IRectElement = {
	"padding": [0, 4, 0, 4],
	"offset": [0, 0],
	"contentWidth": 7,
	"contentHeight": 50,

	"placementMode": {
		"type": "pulse", "config": {
			"alignment": { "x": "centre", "y": "far" },
			"orientation": "top",
			"noSections": 1,
		}
	},

	"style": {
		"fill": "#000000",
		"stroke": "black",
		"strokeWidth": 0
	},

	"ref": "90-pulse",
	"type": "rect"
}

