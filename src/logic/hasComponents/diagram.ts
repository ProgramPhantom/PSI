import Collection, { ICollection, Components } from "../collection";
import { ID, UserComponentType } from "../point";
import Visual, { IVisual, PulseElement } from "../visual";
import Channel from "./channel";
import Sequence from "./sequence";
import SequenceAligner, { ISequenceAligner } from "./sequenceAligner";


export interface IDiagram extends ICollection {
}


export default class Diagram extends Collection<Visual> implements IDiagram {
	static ElementType: UserComponentType = "diagram";
	get state(): IDiagram {
		return {
			...super.state
		};
	}

	// ------------ Top level accessor helpers ------------
	get sequences(): Sequence[] {
		return this.sequenceAligner.children;
	}
	get sequenceDict(): Record<ID, Sequence> {
		return Object.fromEntries(this.sequenceAligner.children.map((item) => [item.id, item]));
	}
	get sequenceIDs(): string[] {
		return Object.keys(this.sequenceDict);
	}

	get channelsDict(): { [name: string]: Channel } {
		var channels: { [name: string]: Channel } = {};
		this.sequenceAligner.children.forEach((s) => {
			Object.entries(s.channelsDict).forEach(([id, channel]) => {
				channels[id] = channel;
			});
		});
		return channels;
	}
	get channels(): Channel[] {
		return this.sequenceAligner.children.map((s) => s.children).flat();
	}
	get channelIDs(): string[] {
		return this.sequenceAligner.children.map((s) => s.channelIDs).flat();
	}

	get allPulseElements(): Visual[] {
		var elements: Visual[] = [];
		this.sequenceAligner.children.forEach((s) => {
			elements.push(...s.allPulseElements);
		});
		return elements;
	}
	// ----------------------------------------------------

	get sequenceAligner(): SequenceAligner {
		let sequenceAligner: SequenceAligner | undefined = this.roles["sequence-aligner"].object as SequenceAligner | undefined;

		if (sequenceAligner === undefined) {
			throw new Error(`Cannot find required child 'sequence-aligner' in ${this.ref}`)
		}
		return sequenceAligner
	}

	roles: Components = {
		"sequence-aligner": {
			object: undefined
		}
	}

	constructor(params: IDiagram) {
		super(params);
	}
}
