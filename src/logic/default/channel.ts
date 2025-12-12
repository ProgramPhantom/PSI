import { IChannel } from "../hasComponents/channel";

export const DEFAULT_CHANNEL: IChannel = {
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"ref": "my-channel",
	"sequenceID": null,
	"children": [],
	"pulseElements": [],
	"placementMode": {"type": "managed"},
	"sizeMode": {"x": "fixed", "y": "fixed"},
	

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
		"padding": [0, 5, 0, 0],
		"ref": "channel-symbol",
		"text": "^{1}\\mathrm{H}",
		"placementMode": {"type": "managed"},
		"sizeMode": {"x": "fixed", "y": "fixed"},
		"style": {
			"fontSize": 50,
			"colour": "black",
			"display": "block",
			"background": null
		}
	},

	"bar": {		
		"padding": [0, 0, 0, 0],
		"offset": [0, 0],

		"contentWidth": 20,
		"contentHeight": 3,

		"placementMode": {"type": "grid", 
			"gridConfig": {
				"coords": {"row": 1, "col": 1},
				"alignment": {"x": "here", "y": "here"},
				"gridSize": {"noRows": 1, "noCols": 1}
			}
		},
		"sizeMode": {"x": "grow", "y": "fixed"},

		"style": {
			"fill": "#000000",
			"stroke": "black",
			"strokeWidth": 0
		},

	"ref": "bar"
	}
}