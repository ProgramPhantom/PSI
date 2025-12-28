import { IDiagram } from "../hasComponents/diagram";
import { DEFAULT_BAR } from "./bar";


export const DEFAULT_DIAGRAM: IDiagram = {
	"sequenceAligner": {
		"mainAxis": "y",
		"minCrossAxis": 0,
		"contentWidth": 0,
		"contentHeight": 0,
		"offset": [0, 0],
		"padding": [0, 0, 0, 0],
		"placementMode": {"type": "free"},
		"ref": "sequence-aligner",
		"sequences": [],
		"children": [
			{
				"placementMode": {"type": "managed"},
				"ref": "sequence",
				"x": 0,
				"y": 0,
				"minHeight": 0,
				"minWidth": 20,
				"padding": [0, 0, 0, 0],
				"offset": [0, 0],

				"children": [],
				"channels": [
					{
						"padding": [10, 0, 10, 0],
						"offset": [0, 0],
						"ref": "my-channel",
						"sequenceID": null,
						"children": [],
						"pulseElements": [],
						"placementMode": {"type": "managed"},

						"style": {
							"thickness": 2,
							"barStyle": {
								"fill": "#000000",
								"stroke": null,
								"strokeWidth": null
							}
						},

						"label": {
							"offset": [0, 0],
							"padding": [0, 5, 0, 0],
							"ref": "channel-symbol",
							"text": "^{1}\\mathrm{H}",
							"placementMode": {"type": "managed"},
							"style": {
								"fontSize": 50,
								"colour": "black",
								"display": "block",
								"background": null
							}
						},

						"bar": DEFAULT_BAR
					}
				]
			}
		]
	},
	"children": [],
	"placementMode": {"type": "free"},
	"offset": [0, 0],
	"padding": [10, 10, 10, 10],
	"contentWidth": 87,
	"contentHeight": 83,
	"x": 0,
	"y": 0,
	"ref": "diagram",
	"id": "c8014d41f304e",
	"type": "diagram"
}