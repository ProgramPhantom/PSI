import { ISVGElement } from "../../svgElement"

export const DEFAULT_AMP: ISVGElement = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"svgDataRef": "amp",
	"contentWidth": 15,
	"contentHeight": 40,

	"placementMode": {"type": "pulse", "config": {
		"alignment": {"x": "centre", "y": "far"},
		"orientation": "top",
		"noSections": 1,
	}},

	"ref": "amp",
	"style": {}
}
