import { IChannel } from "../hasComponents/channel";
import { DEFAULT_BAR } from "./bar";
import { DEFAULT_CHIRPHILO } from "./svgPulse/chirphilo";
import { DEFAULT_TEXT } from "./text";

export const DEFAULT_CHANNEL: IChannel = {
	"padding": [10, 0, 10, 0],
	"offset": [0, 0],
	"ref": "my-channel",
	"children": [],
	"sizeMode": { "x": "fit", "y": "fit" },
	"placementControl": "auto",

	"label": DEFAULT_TEXT,

	"bar": DEFAULT_BAR,
	"type": "channel",

}