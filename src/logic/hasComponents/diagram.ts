import Collection, { ICollection } from "../collection";
import blankDiagram from "../default/blankDiagram.json";
import { UserComponentType } from "../diagramHandler";
import { ID } from "../point";
import { FillObject, RecursivePartial } from "../util";
import { Visual } from "../visual";
import Sequence from "./sequence";

import SequenceAligner, { ISequenceAligner } from "./sequenceAligner";


export interface IDiagram extends ICollection {
	sequenceAligner: ISequenceAligner
}


export default class Diagram extends Collection<Visual> implements IDiagram {
	static defaults: {[key: string]: IDiagram} = {
		default: {...(<any>blankDiagram)}
	};
	static ElementType: UserComponentType = "diagram";

	get state(): IDiagram {
		return {
			sequenceAligner: this.sequenceAligner.state,
			...super.state
		};
	}

	sequenceAligner: SequenceAligner;

	constructor(pParams: RecursivePartial<IDiagram>, templateName: string = "default") {
		var fullParams: IDiagram = FillObject(pParams, Diagram.defaults[templateName]);
		super(fullParams, templateName);


		this.sequenceAligner = new SequenceAligner(fullParams.sequenceAligner)
	}

	// Adding
	public addSequence(sequence: Sequence) {
		this.add(sequence);
	}
}
