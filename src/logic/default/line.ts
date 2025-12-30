import { ILine } from "../line";


export const DEFAULT_LINE: ILine = {
	"ref": "default-arrow",
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"thickness": 1,
	"placementMode": {"type": "managed"},
	"sizeMode": {"x": "grow", "y": "fit"},
	"adjustment": [0, 0],

	"lineStyle": {
		"stroke": "black",
		"dashing": [0, 0],
		"headStyle": ["default", "default"]
	}
}
