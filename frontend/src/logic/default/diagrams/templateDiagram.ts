import { IDiagram } from "../../hasComponents/diagram";
import { ISequenceAligner } from "../../hasComponents/sequenceAligner";
import { DEFAULT_SEQUENCE } from "../sequence";

export const TEMPLATE_DIAGRAM: IDiagram = {
	"children": [
		{
			"role": "sequence-aligner",
			"id": "template-sequence-aligner",
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
		} as ISequenceAligner
	],
	"placementMode": { "type": "free" },
	"offset": [0, 0],
	"padding": [10, 10, 10, 10],
	"contentWidth": 120,
	"contentHeight": 100,
	"x": 0,
	"y": 0,
	"ref": "template-diagram",
	"id": "c8014d41-f304-4e2e-a076-a6a425131ad4",
	"type": "diagram"
};
