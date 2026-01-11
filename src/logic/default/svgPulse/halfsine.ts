import { ISVGElement } from "../../svgElement"

export const DEFAULT_HALFSINE: ISVGElement = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"svgDataRef": "halfsine",
	"contentWidth": 15,
	"contentHeight": 20,

	"placementMode": {
		"type": "pulse", "config": {
			"alignment": { "x": "centre", "y": "far" },
			"orientation": "top",
			"noSections": 1,
		}
	},

	"ref": "halfsine",
	"style": {},
	"type": "svg"
}