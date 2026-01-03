
import Aligner, { IAligner } from "../aligner";
import { UserComponentType } from "../point";
import Visual from "../visual";
import Sequence, { ISequence } from "./sequence";

export interface ISequenceAligner extends IAligner<ISequence> {
	sequences: ISequence[]
}

const DEFAULT_SEQUENCE: ISequence = {
	"placementMode": {"type": "managed"},
	"ref": "sequence",
	"x": 0,
	"y": 0,

	"padding": [5, 5, 5, 5],
	"offset": [0, 0],

	"children": [],
	"channels": [
		{
			"padding": [0, 0, 0, 0],
			"offset": [0, 0],
			"ref": "my-channel",
			"children": [],
			"pulseElements": [],
			"placementMode": {"type": "managed"},

			"style": {
				"thickness": 3,
				"barStyle": {
					"fill": "#000000",
					"stroke": null,
					"strokeWidth": null
				}
			},

			"label": {
				"offset": [0, 0],
				"padding": [0, 0, 0, 0],
				"ref": "channel-symbol",
				"text": "^{1}\\mathrm{H}",
				"placementMode": {"type": "managed"},
				"style": {
					"fontSize": 50,
					"colour": "black",
					"display": "block",
					"background": null
				}
			},

			"bar": {		
				"padding": [0, 4, 0, 4],
				"offset": [0, 0],

				"contentWidth": 7,
				"contentHeight": 50,

				"placementMode": {"type": "grid", 
					"gridConfig": {
						"coords": {"row": 1, "col": 1},
						"alignment": {"x": "here", "y": "here"},
						"gridSize": {"noRows": 1, "noCols": 1}
					},
				},

				"style": {
					"fill": "#000000",
					"stroke": "black",
					"strokeWidth": 0
				},

			"ref": "bar"
		}
		}
	]
}

export default class SequenceAligner extends Aligner<Sequence> implements ISequenceAligner {
	static ElementType: UserComponentType = "sequence-aligner";

	get state(): ISequenceAligner {
		return {
			sequences: this.sequences.map(s => s.state),
			...super.state as IAligner<ISequence>
		};
	}

	get sequences(): Sequence[] {
		return this.children;
	}

	constructor(params: ISequenceAligner) {
		super(params);

		// Initial sequence:
		if (params.children.length === 0) {
			var startSequence = new Sequence(DEFAULT_SEQUENCE);
			this.add(startSequence);
		}

		params.children.forEach((s) => {
			var newSeq = new Sequence(s);
			this.add(newSeq);
		});
	}

	// Adding
	public addPulse(pulse: Visual) {
		if (pulse.placementMode.type !== "pulse") {
			console.warn(`Cannot mount pulse with no pulse type config`)
			return
		}

		var sequenceId = pulse.placementMode.config.sequenceID;

		if (sequenceId === undefined) {
			console.warn(`Cannot locate sequence id on pulse positioned object ${pulse.ref}`)
			return
		}

		// Find the sequence that this pulse belongs to:
		var sequenceIndex: number | undefined = this.locateChildById(sequenceId);

		if (sequenceIndex === undefined) {
			console.warn(`Cannot locate sequence of id ${sequenceId}`)
			return
		}

		var targetSequence: Sequence = this.sequences[sequenceIndex];
		
		targetSequence.addPulse(pulse);
	}

	public deletePulse(pulse: Visual, holdColOpen: boolean=false) {
		if (pulse.placementMode.type !== "pulse") {
			console.warn(`Cannot remove pulse that is not of pulse position type`)
			return
		}

		let sequenceId: string | undefined = pulse.placementMode.config.sequenceID;

		if (sequenceId === undefined) {
			console.warn(`Cannot locate sequence id on pulse positioned object ${pulse.ref}`)
			return
		}

		let sequenceIndex: number | undefined = this.locateChildById(sequenceId);

		if (sequenceIndex === undefined) {
			console.warn(`Cannot locate sequence of id ${sequenceId}`)
			return
		}
		
		let targetSequence: Sequence = this.sequences[sequenceIndex];

		targetSequence.remove(pulse, {row: false, col: !holdColOpen});
	}
}
