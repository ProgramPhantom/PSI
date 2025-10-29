
import Aligner, { IAligner } from "../aligner";
import { UserComponentType } from "../diagramHandler";
import { Visual } from "../visual";
import Sequence, { ISequence } from "./sequence";


export interface ISequenceAligner extends IAligner {
	sequences: ISequence[]
}


export default class SequenceAligner extends Aligner<Sequence> implements ISequenceAligner {
	static ElementType: UserComponentType = "sequence-aligner";

	get state(): ISequenceAligner {
		return {
			sequences: this.sequences.map(s => s.state),
			...super.state
		};
	}

	get sequences(): Sequence[] {
		return this.alignerChildren;
	}

	constructor(params: ISequenceAligner) {
		super(params);


		// Initial sequence:
		if (params.alignerChildren.length === 0) {
			var startSequence = new Sequence({});
			this.add(startSequence);
		}

		params.alignerChildren.forEach((s) => {
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

		// Find the sequence that this pulse belongs to:
		var sequenceIndex = this.locateChildById(sequenceId);

		var targetSequence = this.sequences[sequenceIndex];
		
		targetSequence.addPulse(pulse);
	}

	public deletePulse(pulse: Visual) {
		if (pulse.placementMode.type !== "pulse") {
			console.warn(`Cannot remove pulse that is not of pulse position type`)
			return
		}

		var sequenceId = pulse.placementMode.config.sequenceID;

		var sequenceIndex = this.locateChildById(sequenceId);
		var targetSequence = this.sequences[sequenceIndex];

		targetSequence.remove(pulse);
	}
}
