
import Aligner, { IAligner } from "../aligner";
import { DEFAULT_SEQUENCE } from "../default/sequence";
import { UserComponentType } from "../point";
import Visual, { AlignerElement, PulseElement } from "../visual";
import Sequence, { ISequence } from "./sequence";

export interface ISequenceAligner extends IAligner<ISequence> {

}

export default class SequenceAligner extends Aligner<AlignerElement<Sequence>> implements ISequenceAligner {
	static ElementType: UserComponentType = "sequence-aligner";

	get state(): ISequenceAligner {
		return {
			...super.state,
			children: this.children.map(c => c.state)
		};
	}

	get sequences(): AlignerElement<Sequence>[] {
		return this.children;
	}

	constructor(params: ISequenceAligner) {
		super(params);

	}
}
