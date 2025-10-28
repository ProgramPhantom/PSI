import Collection, { ICollection } from "../collection";
import blankDiagram from "../default/blankDiagram.json";
import { UserComponentType } from "../diagramHandler";
import { ID } from "../point";
import { FillObject, RecursivePartial } from "../util";
import { IVisual, Visual } from "../visual";
import Channel from "./channel";
import Sequence from "./sequence";

import SequenceAligner, { ISequenceAligner } from "./sequenceAligner";


export interface IDiagram extends ICollection {
	sequenceAligner: ISequenceAligner
}


export default class Diagram extends Collection<Visual> implements IDiagram {
	static defaults: {[key: string]: IDiagram} = {
		default: {
			sequenceAligner: SequenceAligner.defaults["default"],
			children: [],
			offset: [0, 0],
			padding: [0, 0, 0, 0],
			placementMode: {type: "free", sizeMode: "fit"},
			x: 0,
			y: 0,
			ref: "diagram",
			id: "c8014d41f304e",
			type: "diagram"
		}
	};
	static ElementType: UserComponentType = "diagram";

	get state(): IDiagram {
		return {
			sequenceAligner: this.sequenceAligner.state,
			...super.state
		};
	}

	// ------------ Top level accessor helpers ------------
	get sequences(): Sequence[] {
		return this.sequenceAligner.alignerChildren;
	}
	get sequenceDict(): Record<ID, Sequence> {
		return Object.fromEntries(this.sequenceAligner.alignerChildren.map((item) => [item.id, item]));
	}
	get sequenceIDs(): string[] {
		return Object.keys(this.sequenceDict);
	}

	get channelsDict(): {[name: string]: Channel} {
		var channels: {[name: string]: Channel} = {};
		this.sequenceAligner.alignerChildren.forEach((s) => {
			Object.entries(s.channelsDict).forEach(([id, channel]) => {
				channels[id] = channel;
			});
		});
		return channels;
	}
	get channels(): Channel[] {
		return this.sequenceAligner.alignerChildren.map((s) => s.channels).flat();
	}
	get channelIDs(): string[] {
		return this.sequenceAligner.alignerChildren.map((s) => s.channelIDs).flat();
	}

	get allPulseElements(): Visual[] {
		var elements: Visual[] = [];
		this.sequenceAligner.alignerChildren.forEach((s) => {
			elements.push(...s.allPulseElements);
		});
		return elements;
	}
	// ----------------------------------------------------

	sequenceAligner: SequenceAligner;

	constructor(pParams: RecursivePartial<IDiagram>, templateName: string = "default") {
		var fullParams: IDiagram = FillObject(pParams, Diagram.defaults[templateName]);
		super(fullParams, templateName);


		this.sequenceAligner = new SequenceAligner(fullParams.sequenceAligner);
		this.add(this.sequenceAligner);
	}

	// Adding
	public addSequence(sequence: Sequence) {
		this.add(sequence);
	}

	public addPulse(pulse: Visual) {
		this.sequenceAligner.addPulse(pulse);
	}

	public deletePulse(pulse: Visual) {
		this.sequenceAligner.deletePulse(pulse);
	}
}
