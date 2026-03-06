import { IChannel } from "../hasComponents/channel";
import { ISVGElement } from "../svgElement";
import { DEFAULT_BAR } from "./bar";
import { DEFAULT_CHANNEL_TEXT } from "./defaultChannelLabel";

export const DEFAULT_CHANNEL: IChannel = {
	"padding": [10, 0, 10, 0],
	"offset": [0, 0],
	"ref": "my-channel",

	"children": [
		DEFAULT_CHANNEL_TEXT,
		DEFAULT_BAR,
		{
			"asset": { ref: "chirplohi", id: "builtin" },
			"style": {},
			"offset": [
				0,
				1
			],
			"padding": [
				0,
				0,
				0,
				0
			],
			"contentWidth": 50,
			"contentHeight": 20,
			"placementMode": {
				"type": "grid",
				"config": {
					"alignment": {
						"x": "centre",
						"y": "far"
					},
					"coords": {
						"row": 0,
						"col": 1
					},
					"gridSize": {
						"noRows": 1,
						"noCols": 1
					}
				}
			},
			"placementControl": "user",
			"sizeMode": {
				"x": "fixed",
				"y": "fixed"
			},
			"pulseData": {
				"channelID": "a227a4ae873248",
				"sequenceID": "af87912kas83",
				"clipBar": false,
				"noSections": 1,
				"index": 1,
				"orientation": "top",
				"alignment": {
					"x": "centre",
					"y": "far"
				}
			},
			"x": 44.535,
			"y": 20,
			"ref": "chirplohi",
			"id": "faa874c9945f9",
			"type": "svg",
			"parentId": "a227a4ae873248"
		} as ISVGElement
	],

	"sizeMode": { "x": "fit", "y": "fit" },
	"placementMode": {
		"type": "subgrid",
		"config": {
			"fill": { rows: false, cols: true },
			"coords": { row: 0, col: 0 }
		}
	},
	"type": "channel",
}