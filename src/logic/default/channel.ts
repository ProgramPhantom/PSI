import { IChannel } from "../hasComponents/channel";
import { ISVGElement } from "../svgElement";
import { DEFAULT_BAR } from "./bar";
import { DEFAULT_CHIRPHILO } from "./svgPulse/chirphilo";

export const DEFAULT_CHANNEL: IChannel = {
	"padding": [10, 0, 10, 0],
	"offset": [0, 0],
	"ref": "my-channel",
	"children": [],
	"pulseElements": [
		DEFAULT_CHIRPHILO
	],
	"sizeMode": { "x": "fixed", "y": "fixed" },
	"placementControl": "auto",

	"label": {
		"offset": [0, 0],
		"padding": [0, 5, 0, 0],
		"ref": "channel-symbol",
		"text": "^{1}\\mathrm{H}",
		"sizeMode": { "x": "fixed", "y": "fixed" },
		"style": {
			"fontSize": 50,
			"colour": "black",
			"display": "block",
			"background": null
		},
		"type": "label"
	},

	"bar": DEFAULT_BAR,
	"type": "channel"
}