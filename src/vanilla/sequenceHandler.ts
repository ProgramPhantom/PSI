import Abstract, { IAbstract } from "./abstract";
import Sequence from "./sequence";
import Span, { ISpan } from "./span";
import { S } from "memfs/lib/constants";
import { Svg } from "@svgdotjs/svg.js";
import Text from "./text";
import { Display, IVisual, Visual } from "./visual";
import Channel, { IChannel } from "./channel";
import { PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import { Script } from "vm";
import Parser from "./parser";
import { mountableElements } from "./default/data";
import { Position } from "@blueprintjs/core";
import { ILine, Line } from "./line";
import RectElement, { IRect, } from "./rectElement";
import SVGElement, { ISVG, } from "./svgElement";
import logger, { Operations } from "./log";
import { error } from "console";
import Labellable from "./labellable";
import { ILabel } from "./label";


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
        "element": SVGElement,

        "pulse90": RectElement,
        "pulse180": RectElement,
    }
    isPositional(elementName: string): boolean {return Object.keys(SequenceHandler.positionalTypes).includes(elementName)}

   //static annotationTypes: {[name: string]: typeof Section} = {
   //    "section": Section
   //}
   //isAnnotation(name: string): boolean {return Object.keys(SequenceHandler.annotationTypes).includes(name)}
 
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

    draw() {
        if (!this.surface) {
            throw new Error("Svg surface not attached!")
        }

        this.surface.size(`${this.sequence.width}px`, `${this.sequence.height}px`)
        this.sequence.draw(this.surface);
        this.syncExternal();
    }


    public addElementFromTemplate(pParameters: RecursivePartial<IVisual>, elementRef: string) {
        var positionalType = SequenceHandler.positionalTypes[elementRef];

        var element;

        switch (positionalType.name) {
            case (SVGElement.name):
                element = new SVGElement(pParameters, elementRef)
                break;
            case (RectElement.name):
                element = new RectElement(pParameters, elementRef)
                break;
            default:
                throw new Error("error 1")
        }


        this.sequence.addElement(element);
    }

    public moveElement(element: Visual) {
        throw new Error("not implemented")
        
        // Move element
    }

    public replaceElement(target: Visual, newElement: Visual): void {
        if (target.isMountable) {
            this.replaceMountable(target, newElement)
        } else {
            throw new Error("not implemented")
        }
    }

    public deleteElement(target: Visual) {
        if (target.isMountable) {
            this.deleteMountedElement(target, true);
        }
    }

    public identifyElement(id: string): Visual | undefined {
        var element: Visual | undefined = undefined;

        // Search for element:
        this.channels.forEach((c) => {
            c.mountedElements.forEach((p) => {
                if (p.id === id) {
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

    public addElement(element: Visual) {
        if (element.isMountable === true) {
            this.mountElement(element, false);
        } else {
            throw new Error("Not implemented")
        }
    }


    /* Interaction commands:
    Add a positional element by providing elementName, channel name, and partial positional interface.
    Function uses element name to lookup default parameters and replaces with those provided */
    
    public mountElementFromTemplate(pParameters: RecursivePartial<IVisual>, elementRef: string, insert: boolean=false) {
        var positionalType = SequenceHandler.positionalTypes[elementRef];

        var element;

        var testLabel: ILabel = {

            offset: [0, 0],
            padding: [0, 0, 3, 0],

            text: {
                text: "\\textrm{90}°",
                padding: [0, 0, 0, 0],
                offset: [0, 0],
            
            
                style: {
                    fontSize: 16,
                    colour: "black",
                    display: Display.Block
                }
            }
        }

        var l: Labellable<Visual>;
        switch (positionalType.name) {
            case (SVGElement.name):
                element = new SVGElement(pParameters, elementRef)
                l = new Labellable<SVGElement>({labelMap: {top: testLabel}, offset: [0, 0], padding: [0, 0, 0, 0], mountConfig: element.mountConfig}, 
                    element, "default", "pulse collection");
                break;
            case (RectElement.name):
                element = new RectElement(pParameters, elementRef);
                l = new Labellable<RectElement>({labelMap: {}, offset: [0, 0], padding: [0, 0, 0, 0]}, element, elementRef);
                break;
            default:
                throw new Error("error 1")
        }

        
        this.sequence.mountElement(l, insert);
    }

    // @isMountable
    private mountElement(target: Visual, insert: boolean=true) {
        this.sequence.mountElement(target, insert);
        this.draw();
    }

    private deleteMountedElement(target: Visual, removeColumn: boolean=true): true | undefined {
        logger.operation(Operations.DELETE, `${target}`)

        // Find which channel owns this element:
        try {
            this.sequence.deleteMountedElement(target, removeColumn);
        } catch (e) {
            console.error(e)
            return undefined;
        }

        this.draw();
        return true;
    }

    private replaceMountable(target: Visual,  newElement: Visual) {
        logger.operation(Operations.MODIFY, `${target} -> ${newElement}`)

        this.deleteMountedElement(target, false);

        this.sequence.mountElement(newElement, false);
     
        this.draw();
    }

    // @isMountable
    public shiftMountedElements(target: Visual, index: number): void {
        //target.index = index;
        this.deleteMountedElement(target, true);

        target.mountConfig!.index = index;
        this.mountElement(target);
    }
}