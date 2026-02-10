import { IDiagram } from "../hasComponents/diagram";
import { ISequenceAligner } from "../hasComponents/sequenceAligner";


export const BLANK_DIAGRAM: IDiagram = {
	"placementMode": { "type": "free" },
	"children": [
		{
			"role": "sequence-aligner",
			"mainAxis": "x",
			"minCrossAxis": 0,
			"contentWidth": 0,
			"contentHeight": 0,
			"offset": [0, 0],
			"padding": [0, 0, 0, 0],
			"placementMode": { "type": "free" },
			"ref": "sequence-aligner",
			"sequences": [],
			"children": [],
			"type": "sequence-aligner"
		} as ISequenceAligner
	],
	"offset": [0, 0],
	"padding": [0, 0, 0, 0],
	"contentWidth": 87,
	"contentHeight": 83,
	"x": 0,
	"y": 0,
	"ref": "diagram",
	"id": "c8014d41f304e",
	"type": "diagram"
}
