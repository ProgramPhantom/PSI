import { IRectElement } from "../rectElement";

export const DEFAULT_RECT_ELEMENT: IRectElement = {
	"contentWidth": 10,
	"contentHeight": 10,
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],

	"style": {
		"fill": "#000000",
	},
	"placementMode": {"type": "free"},
	"sizeMode": {x: "fit", y: "fit"},
	"ref": "rect-element"
}
