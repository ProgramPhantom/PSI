
import { Element } from "@svgdotjs/svg.js";
import Aligner, { IAligner } from "../aligner";
import { AddDispatchData, Components, StructuredChildren } from "../collection";
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
		this.placementMode = { type: "free" }
	}

	public override add({ child, index }: AddDispatchData<AlignerElement<Sequence>>) {
		child.placementMode = {
			"type": "aligner",
			config: {
				...child.placementMode.config
			}
		}

		super.add({ child, index })
	}
}
