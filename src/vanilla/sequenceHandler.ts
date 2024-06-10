import Abstract, { IAbstract } from "./abstract";
import Sequence from "./sequence";
import Span, { ISpan } from "./span";
import { S } from "memfs/lib/constants";
import { Svg } from "@svgdotjs/svg.js";
import Bracket, { Direction, IBracket } from "./bracket";
import Label from "./label";
import Positional, { IPositional } from "./positional";
import { Element } from "./element";
import Channel, { IChannel } from "./channel";
import { PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import Section, { ISection } from "./section";
import { Script } from "vm";
import Parser from "./parser";
import { positionalElements } from "./default/data";
import { Position } from "@blueprintjs/core";
import { ILine, Line } from "./line";
import RectElement, { IRect, PositionalRect } from "./rectElement";
import SVGElement, { ISVG } from "./svgElement";


type IPositionalType = (ISVG | IRect) & IPositional

export default class SequenceHandler {
    static positionalTypes: {[name: string]: typeof Element} = {
        "aquire": SVGElement,
        "halfsine": SVGElement,
        "amp": SVGElement,
        "180": SVGElement,
        "trap": SVGElement,
        "talltrap": SVGElement,
        "saltirehilo": SVGElement,
        "saltirelohi": SVGElement,
        "chirphilo": SVGElement,
        "chirplohi": SVGElement,

        "pulse90": RectElement,
        "pulse180": RectElement,

        // "abstract": Abstract,
        // "span": Span
    }
    isPositional(elementName: string): boolean {return Object.keys(SequenceHandler.positionalTypes).includes(elementName)}

    static annotationTypes: {[name: string]: typeof Section} = {
        "section": Section
    }
    isAnnotation(name: string): boolean {return Object.keys(SequenceHandler.annotationTypes).includes(name)}

    commandSegments: number[][] = [];

    sequence: Sequence;
    parser: Parser;

    surface?: Svg;
    dirty: boolean = false;
    get id(): string {
        var id: string = "";
        this.sequence.channels.forEach((c) => {
            c.children.forEach((p) => {
                id += p.id;
            })
        })
        return id;
    }
    // id: string;
    refresh: (uid: string) => void;
    

    get channels(): Channel[] {return this.sequence.channels}
    hasChannel(name: string): boolean {return this.sequence.channelNames.includes(name)}

    constructor(surface: Svg, refresh: (uid: string) => void) {
        // this.id = "";
        this.surface = surface;
        this.sequence = new Sequence({});

        this.refresh = refresh;
        this.parser = new Parser(this, "");
    }

    clear() {
        this.sequence = new Sequence({});
    }

    // ELEMENT ADDIION COMMANDS: 

    // Add a positional ement by providing elementName, channel name, and partial positional interface.
    // Function uses element name to lookup default parameters and replaces with those provided 
    positional(elementName: string, channelName: string, pParameters: RecursivePartial<IPositionalType>, index?: number, insert: boolean=false) {
        // var positionalType: typeof Positional = SequenceHandler.positionalTypes[elementName];
        var positionalType = SequenceHandler.positionalTypes[elementName];

        if (elementName === "section") {
            console.log(elementName)
        } 

        var element;
        index
        
        // Fix for now.
        var defaults: PositionalRect = RectElement.defaults[elementName];
        element = new RectElement(pParameters as RecursivePartial<IRect>, elementName)
        var newPositional: Positional<Element> = new Positional<RectElement>(element, pParameters, defaults);;
        
        switch (positionalType.name) {
            // case (SVGPulse.name):
            //     element = new SVGPulse(pParameters as RecursivePartial<ISvgPulse>, elementName);
            //     break;
            case (RectElement.name):
                var defaults: PositionalRect = RectElement.defaults[elementName];
                element = new RectElement(pParameters as RecursivePartial<IRect>, elementName)

                newPositional = new Positional<RectElement>(element, pParameters, defaults);
                break;
            case (Span.name):
                element = new Span(pParameters, elementName);
                break;
            case (Abstract.name):
                element = new Abstract(pParameters as RecursivePartial<IAbstract>, elementName);
                break;
            default:
                throw new Error("error 1")
        }

        console.log(index)
        this.sequence.addPositional(channelName, newPositional, index, insert);

    }

    // TODO: forced index for channel addition
    channel(name: string, pParameters: RecursivePartial<IChannel>, index?: number) {
        var newChannel = new Channel(pParameters);

        this.sequence.addChannel(name, newChannel);
    }

    // ADD TEMPLATE NAMES
    vLine(channelName: string, pParameters: RecursivePartial<ILine>, index?: number) {
        var newLine = new Line(pParameters, )

        this.sequence.addVLine(channelName, newLine, index)
    }

    // TODO: add template name
    bracket(channelName: string, pParameters: RecursivePartial<IBracket>, index?: number) {
        var newBracket = new Bracket(pParameters);

        this.sequence.addBracket(channelName, newBracket, index)
    }

    section(channelName: string, pParameters: RecursivePartial<ISection>, templateName?: string, indexRange?: [number, number]) {
        var newSection = new Section(pParameters, templateName);

        this.sequence.addSection(channelName, newSection, indexRange);
    }

    // Technical commands:
    syncOn(caller: string) {  // TODO: add narrowing of channels to sync
        var referenceChan = this.sequence.channelsDic[caller];
        var referenceCurs = referenceChan.elementCursor;

        this.sequence.channelNames.forEach((val) => {
            if (val !== caller) {
                this.sequence.channelsDic[val].jumpTimespan(referenceCurs-1);
            }
        })
    }

    syncNext(reference: string) {  // TODO: add narrowing of channels to sync
        var referenceChan = this.sequence.channelsDic[reference];
        var referenceCurs = referenceChan.elementCursor;

        // Sync all
        Object.keys(this.sequence.channelsDic).forEach((val) => {
            if (val !== reference) {
                this.sequence.channelsDic[val].jumpTimespan(referenceCurs);
            }
        })
    }

    draw() {
       
        if (!this.surface) {
            throw new Error("Svg surface not attatched!")
        }
        this.surface.size("1000px", "1000px")
        this.sequence.draw(this.surface);
        this.refresh(this.id);
    }
}