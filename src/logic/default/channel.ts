import { IChannel } from "../hasComponents/channel";
import { DEFAULT_BAR } from "./bar";
import { DEFAULT_CHANNEL_TEXT } from "./defaultChannelLabel";

export const DEFAULT_CHANNEL: IChannel = {
	"padding": [10, 0, 10, 0],
	"offset": [0, 0],
	"ref": "my-channel",
	
	"children": [
		DEFAULT_CHANNEL_TEXT,
		DEFAULT_BAR
	],

	"sizeMode": { "x": "fit", "y": "fit" },
	"placementMode": {
		"type": "subgrid",
		"config": {
			"fill": {rows: false, cols: true},
			"coords": {row: 0, col: 0}
		}
	},
	"type": "channel",
}