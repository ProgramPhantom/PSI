import { ILine } from "../line";


export const DEFAULT_LINE: ILine = {
	"ref": "default-arrow",
	"padding": [0, 0, 0, 0],
	"offset": [0, 0],
	"placementMode": {"type": "binds", "bindings": undefined},
	"adjustment": [0, 0],

	"lineStyle": {
		"stroke": "black",
		"thickness": 1,
		"dashing": [0, 0],
		"headStyle": ["default", "default"]
	}
}
