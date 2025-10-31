import { IDiagram } from "../hasComponents/diagram";


export const DEFAULT_DIAGRAM: IDiagram = {
	"sequenceAligner": {
		"mainAxis": "x",
		"minCrossAxis": 0,
		"contentWidth": 0,
		"contentHeight": 0,
		"offset": [0, 0],
		"padding": [0, 0, 0, 0],
		"placementMode": {"type": "free", "sizeMode": "fit"},
		"ref": "sequence-aligner",
		"sequences": [],
		"alignerChildren": [
			{
				"placementMode": {"type": "managed"},
				"ref": "sequence",
				"x": 0,
				"y": 0,

				"padding": [5, 5, 5, 5],
				"offset": [0, 0],

				"gridChildren": [],
				"channels": [
					{
						"padding": [0, 0, 0, 0],
						"offset": [0, 0],
						"ref": "my-channel",
						"sequenceID": null,
						"gridChildren": [],
						"pulseElements": [],
						"placementMode": {"type": "managed"},

						"style": {
							"thickness": 3,
							"barStyle": {
								"fill": "#000000",
								"stroke": null,
								"strokeWidth": null
							}
						},

						"label": {
							"offset": [0, 0],
							"padding": [0, 0, 0, 0],
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

						"bar": {		
							"padding": [0, 4, 0, 4],
							"offset": [0, 0],

							"contentWidth": 7,
							"contentHeight": 50,

							"placementMode": {"type": "grid", 
								"gridConfig": {
									"coords": {"row": 1, "col": 1},
									"alignment": {"x": "here", "y": "here"},
									"size": {"noRows": 1, "noCols": 1}
								}
							},

							"style": {
								"fill": "#000000",
								"stroke": "black",
								"strokeWidth": 0
							},

						"ref": "bar"
					}
					}
				]
			}
		]
	},
	"children": [],
	"placementMode": {"type": "free", "sizeMode": "fit"},
	"offset": [0, 0],
	"padding": [0, 0, 0, 0],
	"contentWidth": 87,
	"contentHeight": 83,
	"x": 0,
	"y": 0,
	"ref": "diagram",
	"id": "c8014d41f304e",
	"type": "diagram"
}