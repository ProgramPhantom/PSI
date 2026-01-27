import { IGrid } from "../grid";
import { DEFAULT_ACQUIRE } from "./svgPulse/acquire";
import { DEFAULT_AMP } from "./svgPulse/amp";


export const DEFAULT_SUBSEQUENCE: IGrid = {
	"sizeMode": { x: "fit", y: "fit" },

	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"contentWidth": 50,
	"contentHeight": 50,
	"placementMode": {
		"type": "grid",
		"config": {
			"gridSize": {
				"noCols": 1,
				"noRows": 4
			}
		}
	},

	"ref": "sub-sequence",
	"type": "grid",

	"children": [
		{...DEFAULT_ACQUIRE, placementMode: {
			"type": "grid",
			"config": {
				"coords": {row: 0, col: 0}
			}
		}},

		{...DEFAULT_ACQUIRE, placementMode: {
			"type": "grid",
			"config": {
				"coords": {row: 3, col: 0}
			}
		}},
	]
}
