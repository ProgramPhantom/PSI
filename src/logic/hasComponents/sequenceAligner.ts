
import Aligner, { IAligner } from "../aligner";
import { DEFAULT_SEQUENCE } from "../default/sequence";
import { UserComponentType } from "../point";
import Visual, { AlignerElement, PulseElement } from "../visual";
import Sequence, { ISequence } from "./sequence";

export interface ISequenceAligner extends IAligner<ISequence> {
	sequences: ISequence[]
}

export default class SequenceAligner extends Aligner<AlignerElement<Sequence>> implements ISequenceAligner {
	static ElementType: UserComponentType = "sequence-aligner";

	get state(): ISequenceAligner {
		return {
			sequences: this.sequences.map(s => s.state),
			...super.state as IAligner<ISequence>
		};
	}

	get sequences(): AlignerElement<Sequence>[] {
		return this.children;
	}

	constructor(params: ISequenceAligner) {
		super(params);

		// Initial sequence:
		if (params.children.length === 0) {
			var startSequence = new Sequence(DEFAULT_SEQUENCE) as AlignerElement<Sequence>;
			this.add(startSequence);
		}

		params.children.forEach((s) => {
			var newSeq = new Sequence(s) as AlignerElement<Sequence>;
			this.add(newSeq);
		});
	}
}
