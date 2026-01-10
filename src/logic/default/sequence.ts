import { ISequence } from "../hasComponents/sequence";
import { DEFAULT_CHANNEL } from "./channel";

export const DEFAULT_SEQUENCE: ISequence = {
	"ref": "sequence",
	"x": 0,
	"y": 0,
	"minWidth": 10,

	"padding": [0, 0, 0, 0],
	"offset": [0, 0],

	"channels": [DEFAULT_CHANNEL],
	"children": [],
	"placementControl": "auto"
}
