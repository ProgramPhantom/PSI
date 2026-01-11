import { IDiagram } from "../hasComponents/diagram";
import { DEFAULT_BAR } from "./bar";
import { DEFAULT_SEQUENCE } from "./sequence";


export const DEFAULT_DIAGRAM: IDiagram = {
	"sequenceAligner": {
		"mainAxis": "y",
		"minCrossAxis": 0,
		"contentWidth": 0,
		"contentHeight": 0,
		"offset": [0, 0],
		"padding": [0, 0, 0, 0],
		"placementMode": { "type": "free" },
		"ref": "sequence-aligner",
		"sequences": [],
		"children": [
			DEFAULT_SEQUENCE
		],
		"type": "sequence-aligner"
	},
	"children": [],
	"placementMode": { "type": "free" },
	"offset": [0, 0],
	"padding": [10, 10, 10, 10],
	"contentWidth": 87,
	"contentHeight": 83,
	"x": 0,
	"y": 0,
	"ref": "diagram",
	"id": "c8014d41f304e",
	"type": "diagram"
}