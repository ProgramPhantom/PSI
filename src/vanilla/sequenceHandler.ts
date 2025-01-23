import Abstract, { IAbstract } from "./abstract";
import Sequence from "./sequence";
import Span, { ISpan } from "./span";
import { S } from "memfs/lib/constants";
import { Svg } from "@svgdotjs/svg.js";
import Bracket, { Direction, IBracket } from "./bracket";
import Label from "./label";
import Positional, { IPositional, PositionalVisual } from "./positional";
import { IVisual, Visual } from "./visual";
import Channel, { IChannel } from "./channel";
import { PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import Section, { ISection } from "./section";
import { Script } from "vm";
import Parser from "./parser";
import { positionalElements } from "./default/data";
import { Position } from "@blueprintjs/core";
import { ILine, Line } from "./line";
import RectElement, { IRect, PositionalRect } from "./rectElement";
import SVGElement, { ISVG, PositionalSVG } from "./svgElement";
import logger, { Operations } from "./log";


type IPositionalType = (ISVG | IRect) & IPositional

export default class SequenceHandler {
    static positionalTypes: {[name: string]: typeof Visual} = {
        "acquire": SVGElement,
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
    }
    isPositional(elementName: string): boolean {return Object.keys(SequenceHandler.positionalTypes).includes(elementName)}

    static annotationTypes: {[name: string]: typeof Section} = {
        "section": Section
    }
    isAnnotation(name: string): boolean {return Object.keys(SequenceHandler.annotationTypes).includes(name)}

    sequence: Sequence;
    // parser: Parser;

    surface?: Svg;

    get id(): string {
        var id: string = "";
        this.sequence.channels.forEach((c) => {
            c.children.forEach((p) => {
                id += p.id;
            })
        })
        return id;
    }
    syncExternal: () => void;

    get channels(): Channel[] {return this.sequence.channels}
    hasChannel(name: string): boolean {return this.sequence.channelNames.includes(name)}

    constructor(surface: Svg, emitChange: () => void) {
        this.syncExternal = emitChange;

        this.sequence = new Sequence({});

        // this.parser = new Parser(this, "");
        this.surface = surface;
    }

    // TODO: forced index for channel addition
    channel(name: string, pParameters: RecursivePartial<IChannel>, index?: number) {
        if (this.sequence.channelNames.includes(name)) {
            alert(`Duplicate channel name: ${name}`)
            return
        }

        var newChannel = new Channel(pParameters);
        this.sequence.addChannel(name, newChannel);
    }

    // Technical commands:
    draw() {
        if (!this.surface) {
            throw new Error("Svg surface not attatched!")
        }

        this.surface.size(`${this.sequence.width}px`, `${this.sequence.height}px`)
        this.sequence.draw(this.surface);
        this.syncExternal();
    }

    // Interaction commands:
    // Add a positional element by providing elementName, channel name, and partial positional interface.
    // Function uses element name to lookup default parameters and replaces with those provided 
    positional(elementName: string, channelName: string, pParameters: RecursivePartial<IPositionalType>, index?: number, insert: boolean=false) {
        // var positionalType: typeof Positional = SequenceHandler.positionalTypes[elementName];
        var positionalType = SequenceHandler.positionalTypes[elementName];
        var channel: Channel = this.sequence.channelsDic[channelName];

        var element;
        index
        
        // Fix for now.
        var defaults;
        var newPositional: Positional<Visual> | undefined;
        
        switch (positionalType.name) {
            case (SVGElement.name):
                defaults = SVGElement.defaults[elementName];
                element = new SVGElement(pParameters as RecursivePartial<IRect>, elementName)

                newPositional = new Positional<SVGElement>(element, channel, pParameters, defaults);
                break;
            case (RectElement.name):
                defaults = RectElement.defaults[elementName];
                element = new RectElement(pParameters as RecursivePartial<IRect>, elementName)

                newPositional = new Positional<RectElement>(element, channel, pParameters, defaults);
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

        if (newPositional === undefined) {
            throw new Error("This error")
        }

        
        this.sequence.addPositional(channelName, newPositional, index, insert);

    }

    selectPositional(id: string): Positional<Visual> | undefined {
        var element: Positional<Visual> | undefined = undefined;

        // Search for element:
        this.channels.forEach((c) => {
            c.positionalElements.forEach((p) => {
                if (p.element.id === id) {
                    element = p;
                }
            })
        })

        if (element === undefined) {
            console.warn(`Cannot find element "${id}"`);
            return undefined;
        } else {
            return element;
        }
    }

    hardModify<T extends Visual=Visual>(target: Positional<T>, newElement: Positional<T>): true | undefined {
        logger.operation(Operations.MODIFY, `${target} -> ${newElement}`)

        var channel: Channel = target.channel;

        this.deletePositional(target, false);

        this.sequence.addPositional(channel.identifier, newElement, target.index!);
     
        this.draw();

        return true;
    }

    softModify<T extends Visual=Visual>(target: Positional<T>, data: Partial<PositionalVisual<T>>) {
        target.restructure(data);

        this.draw();
    }

    deletePositional<T extends Visual=Visual>(target: Positional<T>, removeColumn: boolean=true): true | undefined {
        logger.operation(Operations.DELETE, `${target}`)

        // Find which channel owns this element:
        try {
            this.sequence.deletePositional(target, removeColumn);
        } catch (e) {
            console.error(e)
            return undefined;
        }

        this.draw();
        return true;
    }
}