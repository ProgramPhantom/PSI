import { Visual, IVisual } from "./visual";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import { Position, IText } from "./text";
import Channel, { ChannelStructure, IChannel } from "./channel"
import Text from "./text";
import { json } from "stream/consumers";
import Arrow, { HeadStyle } from "./arrow";
import defaultDiagram from "./default/data/diagram.json"
import DiagramHandler, { Component, IHaveStructure } from "./diagramHandler";
import { NumberAlias, select } from "svg.js";
import { FillObject, PartialConstruct, RecursivePartial } from "./util";
import { ILine, Line } from "./line";
import Spacial, { Dimensions } from "./spacial";
import Collection, { ICollection } from "./collection";
import PaddedBox from "./paddedBox";
import Aligner from "./aligner";
import logger, { Operations, Processes } from "./log";
import { defaultNewIndexGetter } from "@dnd-kit/sortable";
import { Alignment } from "./mountable";
import Space from "./space";
import Sequence, { SequenceStructures } from "./sequence";
import Point from "./point";


interface IDiagram extends ICollection {
    channels: IChannel[]
}

type DiagramComponent = "sequence column" 
 
export type DiagramStructure = SequenceStructures | ChannelStructure | "abstract" | DiagramComponent


export default class Diagram extends Collection implements IHaveStructure {
    static defaults: {[key: string]: IDiagram} = {"default": {...<any>defaultDiagram}}
    static ElementType: Component = "diagram";

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

    structure: Record<DiagramComponent, Visual>;

    freeArrows: Arrow[] = [];

    root: Spacial;

    sequenceColumn: Aligner<Sequence>;


    get allPulseElements(): Visual[] {
        var elements: Visual[] = [];
        this.sequences.forEach((s) => {
            elements.push(...s.allPulseElements)
        })
        return elements;
    }

    constructor(params: RecursivePartial<IDiagram>, templateName: string="default") {
        var fullParams: IDiagram = FillObject(params, Diagram.defaults[templateName]);
        super(fullParams, templateName);

        logger.processStart(Processes.INSTANTIATE, ``, this);

        this.sequenceDict = {};

        // Root 
        this.root = new Spacial(0, 0, 0, 0, "root");
        

        this.sequenceColumn = new Aligner<Sequence>(
            {bindMainAxis: true, axis: "y", alignment: Alignment.here, ref: "sequence column", x:0, y:0}, "default", );
        this.root.bind(this.sequenceColumn, "x", "here", "here");
        this.root.bind(this.sequenceColumn, "y", "here", "here");
        this.add(this.sequenceColumn);
        
        // Initial sequence:
        var startSequence = new Sequence({}, "default");
        this.addSequence(startSequence);

        

        this.structure = {
            "sequence column": this.sequenceColumn
        }

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

    addFreeArrow(arrow: Arrow) {
        this.add(arrow);
    }

    // Mounting 
    public mountElement(target: Visual, insert: boolean=true) {
        var sequence: Sequence | undefined = this.sequenceDict[target.mountConfig!.sequenceID];

        if (sequence === undefined) {
            throw new Error(`Cannot find sequence with ID: ${target.mountConfig!.sequenceID}`)
        }

        sequence.mountElement(target, insert);
    }

    public deleteMountedElement(target: Visual, removeColumn: boolean=true): boolean {
        var sequence: Sequence | undefined = this.sequenceDict[target.mountConfig!.sequenceID];

        if (sequence === undefined) {
            throw new Error(`Cannot find sequence with ID: ${target.mountConfig?.sequenceID}`);
        }
        
        var columnRemoved: boolean = false;
        columnRemoved = sequence.deleteMountedElement(target, removeColumn);


        return columnRemoved;
    }
}