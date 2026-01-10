
import Aligner, { IAligner } from "../aligner";
import { DEFAULT_SEQUENCE } from "../default/sequence";
import { UserComponentType } from "../point";
import Visual from "../visual";
import Sequence, { ISequence } from "./sequence";

export interface ISequenceAligner extends IAligner<ISequence> {
	sequences: ISequence[]
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

	public deletePulse(pulse: Visual, holdColOpen: boolean = false) {
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

		targetSequence.remove(pulse, { row: false, col: !holdColOpen });
	}
}
