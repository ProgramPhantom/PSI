import { ISubgrid } from "../grid";
import { DEFAULT_ACQUIRE } from "./svgPulse/acquire";


export const DEFAULT_SUBSEQUENCE: ISubgrid = {
	"sizeMode": { x: "fit", y: "fit" },

	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"contentWidth": 50,
	"contentHeight": 50,
	"placementMode": {
		"type": "subgrid",
		"config": {
			"coords": {
				"row": 0,
				"col": 0
			}
		}
	},

	"ref": "sub-sequence",
	"type": "subgrid",

	"children": [
		{...DEFAULT_ACQUIRE, placementMode: {
			"type": "grid",
			"config": {
				"coords": {row: 0, col: 0}
			}},
			pulseData: {
				orientation: "both"
			}	
		},

		{...DEFAULT_ACQUIRE, placementMode: {
			"type": "grid",
			"config": {
				"coords": {row: 3, col: 0}
			},
		},
		pulseData: {
			orientation: "both"
		}	
	},
	]
}
