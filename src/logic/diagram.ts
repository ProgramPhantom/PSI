import Aligner from "./aligner";
import Line from "./line";
import Channel, { ChannelNamedStructure } from "./channel";
import Collection, { ICollection } from "./collection";
import defaultDiagram from "./default/diagram.json";
import { IHaveStructure, UserComponentType } from "./diagramHandler";
import logger, { Processes } from "./log";
import Point from "./point";
import Sequence, { ISequence, SequenceNamedStructures as SequenceNamedStructure } from "./sequence";
import Spacial from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { Visual } from "./visual";


export interface IDiagram extends ICollection {
    sequences: ISequence[]
}

type DiagramNamedStructure = "sequence column" | "root"
 
export type AllStructures = SequenceNamedStructure | ChannelNamedStructure | DiagramNamedStructure
// "Structure" are objects that are created as decendants of components which are used to arrange the their
// content. Currently all structures are abstract (as in, have no visual, they are only used for positioning)
// except for the BAR in the channel component (these might need differentiating)


export default class Diagram extends Collection implements IHaveStructure {
    static defaults: {[key: string]: IDiagram} = {"default": {...<any>defaultDiagram}}
    static ElementType: UserComponentType = "diagram";

    get state(): IDiagram {
        return {
            sequences: this.sequences.map((s) => s.state),
            ...super.state
        }
    }

    sequenceDict: {[name: string]: Sequence;} = {};
    get sequences(): Sequence[] {return Object.values(this.sequenceDict)}
    get sequenceIDs(): string[] {return Object.keys(this.sequenceDict)}

    get channelsDict(): {[name: string]: Channel;} {
        var channels: {[name: string]: Channel} = {}
        this.sequences.forEach((s) => {
            Object.entries(s.channelsDict).forEach(([id, channel]) => {
                channels[id] = channel
            })
        })
        return channels
    }
    get channels(): Channel[] {return this.sequences.map((s) => s.channels).flat()}
    get channelIDs(): string[] {return this.sequences.map((s) => s.channelIDs).flat()}

    structure: Record<DiagramNamedStructure, Point>;

    freeArrows: Line[] = [];

    root: Spacial;

    sequenceColumn: Aligner<Sequence>;


    get allPulseElements(): Visual[] {
        var elements: Visual[] = [];
        this.sequences.forEach((s) => {
            elements.push(...s.allPulseElements)
        })
        return elements;
    }


    constructor(pParams: RecursivePartial<IDiagram>, templateName: string="default") {
        var fullParams: IDiagram = FillObject(pParams, Diagram.defaults[templateName]);
        super(fullParams, templateName);

        logger.processStart(Processes.INSTANTIATE, ``, this);

        this.sequenceDict = {};

        // ----- Create structure ---- 
        // Root 
        this.root = new Spacial(0, 0, 0, 0, "root");

        // Sequence column
        this.sequenceColumn = new Aligner<Sequence>(
            {bindMainAxis: true, axis: "y", alignment: "here", ref: "sequence column", x:0, y:0}, "default", );
        this.root.bind(this.sequenceColumn, "x", "here", "here");
        this.root.bind(this.sequenceColumn, "y", "here", "here");
        this.add(this.sequenceColumn);

        this.structure = {
            "sequence column": this.sequenceColumn,
            "root": this.root
        }
        // --------------------------


        // Initial sequence:
        if (fullParams.sequences.length === 0) {
            var startSequence = new Sequence({});
            this.addSequence(startSequence);
        }

        fullParams.sequences.forEach((s) => {
            var newSeq = new Sequence(s);
            this.addSequence(newSeq);
        })
    

        logger.processEnd(Processes.INSTANTIATE, ``, this);
    }

    // Adding
    public addSequence(sequence: Sequence) {
        this.sequenceColumn.add(sequence);
        this.sequenceDict[sequence.id] = sequence;
    }

    public addElement(element: Visual) {
        if (element.isMountable) {
            element.mountConfig!.mountOn = false;
        }

        // Add
        throw new Error(`Not implemented`)
    }

    addFreeArrow(arrow: Line) {
        this.add(arrow);
    }

    // Mounting 
    public mountElement(target: Visual, insert: boolean=true) {
        var sequence: Sequence | undefined = this.sequenceDict[target.mountConfig?.sequenceID!];

        if (sequence === undefined) {
            throw new Error(`Cannot find sequence with ID: ${target.mountConfig!.sequenceID}`)
        }

        sequence.mountElement(target, insert);
    }

    public deleteMountedElement(target: Visual, removeColumn: boolean=true): boolean {
        var sequence: Sequence | undefined = this.sequenceDict[target.mountConfig?.sequenceID!];

        if (sequence === undefined) {
            throw new Error(`Cannot find sequence with ID: ${target.mountConfig?.sequenceID}`);
        }
        
        var columnRemoved: boolean = false;
        columnRemoved = sequence.deleteMountedElement(target, removeColumn);


        return columnRemoved;
    }
}