import { ISVGElement } from "../../svgElement"

export const DEFAULT_ACQUIRE: ISVGElement = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"svgDataRef": "acquire",
	"contentWidth": 150,
	"contentHeight": 75,

	"placementMode": {
		"type": "pulse", "config": {
			"alignment": { "x": "centre", "y": "far" },
			"orientation": "top",
			"noSections": 1,
		}
	},

	"ref": "acquire",
	"style": {},
	"type": "svg"
}
