import Aligner, { IAligner } from "../aligner";
import Channel, {ChannelNamedStructure} from "./channel";
import Collection, {ICollection, IHaveComponents} from "../collection";
import blankDiagram from "../default/blankDiagram.json";
import {UserComponentType} from "../diagramHandler";
import Line from "../line";
import logger, {Processes} from "../log";
import {ID} from "../point";
import Sequence, {ISequence, SequenceNamedStructures} from "./sequence";
import Spacial from "../spacial";
import {FillObject, MarkAsComponent, RecursivePartial} from "../util";
import {doesDraw, Visual} from "../visual";
import {Element} from "@svgdotjs/svg.js";
import {G} from "@svgdotjs/svg.js";
import { IVisual } from "../../typeCheckers/Visual-ti";
import { ISequenceAligner } from "./sequenceAligner";


export interface IDiagram extends ICollection {
	sequenceAligner: ISequenceAligner
}

type DiagramNamedStructure = "sequence column" | "root";

export type AllStructures = SequenceNamedStructures | ChannelNamedStructure | DiagramNamedStructure;
// "Structure" are objects that are created as descendants of components which are used to arrange the their
// content. Currently all structures are abstract (as in, have no visual, they are only used for positioning)
// except for the BAR in the channel component (these might need differentiating)

export default class Diagram extends Collection<Visual> implements IDiagram {
	static defaults: {[key: string]: IDiagram} = {
		default: {...(<any>blankDiagram)}
	};
	static ElementType: UserComponentType = "diagram";

	get state(): IDiagram {
		return {
			...super.state
		};
	}

	get sequenceDict(): Record<ID, Sequence> {
		return Object.fromEntries(this.alignerChildren.map((item) => [item.id, item]));
	}
	get sequenceIDs(): string[] {
		return Object.keys(this.sequenceDict);
	}

	get channelsDict(): {[name: string]: Channel} {
		var channels: {[name: string]: Channel} = {};
		this.alignerChildren.forEach((s) => {
			Object.entries(s.channelsDict).forEach(([id, channel]) => {
				channels[id] = channel;
			});
		});
		return channels;
	}
	get channels(): Channel[] {
		return this.alignerChildren.map((s) => s.components.channels).flat();
	}
	get channelIDs(): string[] {
		return this.alignerChildren.map((s) => s.channelIDs).flat();
	}

	get allPulseElements(): Visual[] {
		var elements: Visual[] = [];
		this.alignerChildren.forEach((s) => {
			elements.push(...s.allPulseElements);
		});
		return elements;
	}

	constructor(pParams: RecursivePartial<IDiagram>, templateName: string = "default") {
		var fullParams: IDiagram = FillObject(pParams, SequenceAligner.defaults[templateName]);
		super(fullParams, templateName);


		// Initial sequence:
		if (fullParams.alignerChildren.length === 0) {
			var startSequence = new Sequence({});
			this.addSequence(startSequence);
		}

		fullParams.alignerChildren.forEach((s) => {
			var newSeq = new Sequence(s);
			this.addSequence(newSeq);
		});
	}

	// Adding
	public addSequence(sequence: Sequence) {
		this.add(sequence);
	}
}
