import { IChannel } from "../hasComponents/channel";
import { DEFAULT_BAR } from "./bar";
import { DEFAULT_CHANNEL_TEXT } from "./defaultChannelLabel";
import { DEFAULT_LABEL } from "./label";
import { DEFAULT_CHIRPHILO } from "./svgPulse/chirphilo";
import { DEFAULT_TEXT } from "./text";

export const DEFAULT_CHANNEL: IChannel = {
	"padding": [10, 0, 10, 0],
	"offset": [0, 0],
	"ref": "my-channel",
	
	"children": [
		{...DEFAULT_CHANNEL_TEXT, role: "label"},
		{...DEFAULT_BAR, role: "bar"}
	],

	"sizeMode": { "x": "fit", "y": "fit" },
	
	"type": "channel",
}