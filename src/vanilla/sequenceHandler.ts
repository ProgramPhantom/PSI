import Abstract, { IAbstract } from "./abstract";
import SimplePulse, { ISimplePulse } from "./pulses/simple/simplePulse";
import Sequence, { ILine, Line } from "./sequence";
import Span, { ISpan } from "./span";
import { S } from "memfs/lib/constants";
import { Svg } from "@svgdotjs/svg.js";
import Bracket, { Direction, IBracket } from "./bracket";
import Label from "./label";
import Positional, { IPositional } from "./positional";
import { Element } from "./element";
import SVGPulse, { ISvgPulse } from "./pulses/image/svgPulse";
import Channel, { IChannel } from "./channel";
import { PartialConstruct, UpdateObj } from "./util";
import Section, { ISection } from "./section";
import { Script } from "vm";
import Parser from "./parser";
import { positionalElements } from "./default/data";
import { Position } from "@blueprintjs/core";


type IPositionalType = ISimplePulse | ISvgPulse | IAbstract | ISpan

export default class SequenceHandler {
    static positionalTypes: {[name: string]: typeof Positional} = {
        "aquire": SVGPulse,
        "halfsine": SVGPulse,
        "amp": SVGPulse,
        "180": SVGPulse,
        "trap": SVGPulse,
        "talltrap": SVGPulse,
        "saltirehilo": SVGPulse,
        "saltirelohi": SVGPulse,
        "chirphilo": SVGPulse,
        "chirplohi": SVGPulse,

        "pulse90": SimplePulse,
        "pulse180": SimplePulse,

        "abstract": Abstract,
        "span": Span
    }
    isPositional(elementName: string): boolean {return Object.keys(SequenceHandler.positionalTypes).includes(elementName)}

    static annotationTypes: {[name: string]: typeof Section} = {
        "section": Section
    }
    isAnnotation(name: string): boolean {return Object.keys(SequenceHandler.annotationTypes).includes(name)}

    commandSegments: number[][] = [];

    sequence: Sequence;
    parser: Parser;

    get channels(): Channel[] {return this.sequence.channels}
    hasChannel(name: string): boolean {return this.sequence.channelNames.includes(name)}

    constructor() {
        this.sequence = new Sequence(Sequence.defaults["empty"])

        this.parser = new Parser(this, "");
    }

    // ELEMENT ADDIION COMMANDS: 

    // Add a positional ement by providing elementName, channel name, and partial positional interface.
    // Function uses element name to lookup default parameters and replaces with those provided 
    positional(elementName: string, channelName: string, pParameters: Partial<IPositionalType>, index?: number) {
        // var positionalType: typeof Positional = SequenceHandler.positionalTypes[elementName];
        var positionalType = SequenceHandler.positionalTypes[elementName];

        if (elementName === "section") {
            console.log(elementName)
        } 

        var newElement: Positional;
        
        switch (positionalType.name) {
            case (SVGPulse.name):
                newElement = new SVGPulse(pParameters, elementName);
                break;
            case (SimplePulse.name):
                newElement = new SimplePulse(pParameters as Partial<ISimplePulse>, elementName);
                break;
            case (Span.name):
                newElement = new Span(pParameters, elementName);
                break;
            case (Abstract.name):
                newElement = new Abstract(pParameters as Partial<IAbstract>, elementName);
                break;
            default:
                throw new Error("error 1")
        }

        this.sequence.addPositional(channelName, newElement, index);
    }

    // TODO: forced index for channel addition
    channel(name: string, pParameters: Partial<IChannel>, index?: number) {
        var newChannel = new Channel(pParameters);

        this.sequence.addChannel(name, newChannel);
    }

    // ADD TEMPLATE NAMES
    vLine(channelName: string, pParameters: Partial<ILine>, index?: number) {
        var newLine = new Line(pParameters, )

        this.sequence.addVLine(channelName, newLine, index)
    }

    // TODO: add template name
    bracket(channelName: string, pParameters: Partial<IBracket>, index?: number) {
        var newBracket = new Bracket(pParameters);

        this.sequence.addBracket(channelName, newBracket, index)
    }

    section(channelName: string, pParameters: Partial<ISection>, templateName?: string, indexRange?: [number, number]) {
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

    draw(surface: Svg) {this.sequence.draw(surface);}
}