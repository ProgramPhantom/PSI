import Aligner from "../aligner";
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

export interface IDiagramComponents extends Record<string, Spacial | Spacial[]> {
	sequences: Sequence[];

	sequenceColumn: Aligner<Sequence>;
	root: Spacial;
}

export interface IDiagram extends ICollection {
	sequences: ISequence[];
}

type DiagramNamedStructure = "sequence column" | "root";

export type AllStructures = SequenceNamedStructures | ChannelNamedStructure | DiagramNamedStructure;
// "Structure" are objects that are created as descendants of components which are used to arrange the their
// content. Currently all structures are abstract (as in, have no visual, they are only used for positioning)
// except for the BAR in the channel component (these might need differentiating)

export default class Diagram extends Collection implements IHaveComponents<IDiagramComponents> {
	static defaults: {[key: string]: IDiagram} = {
		default: {...(<any>blankDiagram)}
	};
	static ElementType: UserComponentType = "diagram";

	get state(): IDiagram {
		return {
			sequences: this.components.sequences.map((s) => s.state),
			...super.state
		};
	}

	get sequenceDict(): Record<ID, Sequence> {
		return Object.fromEntries(this.components.sequences.map((item) => [item.id, item]));
	}
	get sequenceIDs(): string[] {
		return Object.keys(this.sequenceDict);
	}

	get channelsDict(): {[name: string]: Channel} {
		var channels: {[name: string]: Channel} = {};
		this.components.sequences.forEach((s) => {
			Object.entries(s.channelsDict).forEach(([id, channel]) => {
				channels[id] = channel;
			});
		});
		return channels;
	}
	get channels(): Channel[] {
		return this.components.sequences.map((s) => s.components.channels).flat();
	}
	get channelIDs(): string[] {
		return this.components.sequences.map((s) => s.channelIDs).flat();
	}

	components: IDiagramComponents;

	get allPulseElements(): Visual[] {
		var elements: Visual[] = [];
		this.components.sequences.forEach((s) => {
			elements.push(...s.allPulseElements);
		});
		return elements;
	}

	constructor(pParams: RecursivePartial<IDiagram>, templateName: string = "default") {
		var fullParams: IDiagram = FillObject(pParams, Diagram.defaults[templateName]);
		super(fullParams, templateName);

		logger.processStart(Processes.INSTANTIATE, ``, this);

		// ----- Create structure ----

		// Root
		var root: Spacial = new Spacial(0, 0, 0, 0, "root");

		// Sequence column
		var sequenceColumn: Aligner<Sequence> = new Aligner<Sequence>(
			{
				bindMainAxis: true,
				axis: "y",
				alignment: "here",
				ref: "sequence column",
				x: 0,
				y: 0
			},
			"default"
		);
		root.bind(sequenceColumn, "x", "here", "here");
		root.bind(sequenceColumn, "y", "here", "here");
		this.add(sequenceColumn);

		this.components = {
			root: root,
			sequenceColumn: sequenceColumn,
			sequences: []
		};
		MarkAsComponent(this.components);
		// --------------------------

		// Initial sequence:
		if (fullParams.sequences.length === 0) {
			var startSequence = new Sequence({});
			this.addSequence(startSequence);
		}

		fullParams.sequences.forEach((s) => {
			var newSeq = new Sequence(s);
			this.addSequence(newSeq);
		});

		logger.processEnd(Processes.INSTANTIATE, ``, this);
	}

	override draw(surface: Element) {
		if (this.svg) {
			this.svg.remove();
		}

		surface.clear();
		this.svg = surface;

		var group = new G().id(this.id).attr({title: this.ref});
		group.attr({
			transform: `translate(${this.offset[0]}, ${this.offset[1]})`
		});

		// Add component children to group
		this.componentChildren.forEach((c) => {
			if (doesDraw(c)) {
				c.draw(group);
			}
		});
		// group.move(this.x, this.y).size(this.width, this.height)

		this.svg
			.attr({
				"data-position": this.positionMethod,
				"data-ownership": this.ownershipType
			})
			.id(this.id);

		this.svg.add(group);

		this.userChildren.forEach((uc) => {
			if (doesDraw(uc)) {
				uc.draw(surface);
			}
		});
	}

	// Adding
	public addSequence(sequence: Sequence) {
		this.markComponent(sequence);
		this.components.sequenceColumn.add(sequence);
		this.components.sequences.push(sequence);
	}

	public addElement(element: Visual) {
		if (element.isMountable) {
			element.mountConfig!.mountOn = false;
		}

		// Add
		throw new Error(`Not implemented`);
	}

	addFreeArrow(arrow: Line) {
		this.add(arrow);
	}

	// Mounting
	public mountElement(target: Visual, insert: boolean = true) {
		var sequence: Sequence | undefined = this.sequenceDict[target.mountConfig?.sequenceID!];

		if (sequence === undefined) {
			throw new Error(`Cannot find sequence with ID: ${target.mountConfig!.sequenceID}`);
		}

		sequence.mountElement(target, insert);
	}

	public deleteMountedElement(target: Visual, removeColumn: boolean = true): boolean {
		var sequence: Sequence | undefined = this.sequenceDict[target.mountConfig?.sequenceID!];

		if (sequence === undefined) {
			throw new Error(`Cannot find sequence with ID: ${target.mountConfig?.sequenceID}`);
		}

		var columnRemoved: boolean = false;
		columnRemoved = sequence.deleteMountedElement(target, removeColumn);

		return columnRemoved;
	}
}
