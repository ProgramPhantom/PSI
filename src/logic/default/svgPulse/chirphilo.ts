import { ISVGElement } from "../../svgElement"

export const DEFAULT_CHIRPHILO: ISVGElement = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"svgDataRef": "chirphilo",
	"contentWidth": 50,
	"contentHeight": 20,

	"placementMode": {"type": "pulse", "config": {
		"alignment": {"x": "centre", "y": "far"},
		"orientation": "top",
		"noSections": 1,
	}},

	"ref": "chirphilo",
	"style": {}
}