import Abstract, { IAbstract } from "./abstract";
import Sequence from "./sequence";
import Span, { ISpan } from "./span";
import { S } from "memfs/lib/constants";
import { Svg } from "@svgdotjs/svg.js";
import Text, { Position } from "./text";
import { Display, IVisual, Visual } from "./visual";
import Channel, { IChannel } from "./channel";
import { PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import { Script } from "vm";
import Parser from "./parser";
import { mountableElements } from "./default/data";
import { ILine, Line } from "./line";
import RectElement, { IRect, } from "./rectElement";
import SVGElement, { ISVG, } from "./svgElement";
import logger, { Operations } from "./log";
import { error } from "console";
import Labellable, { ILabellable } from "./labellable";
import { ILabel } from "./label";
import { ElementTypes, ID } from "./point";
import { ElementType } from "react";
import { IMountConfig } from "./mountable";


export type ElementBundle = IVisual & Partial<ILabellable>


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
    channel(pParameters: RecursivePartial<IChannel>, index?: number) {
        if (pParameters.identifier === undefined) {
            alert(`Channel id not provided`)
            return
        }
        if (this.sequence.channelNames.includes(pParameters.identifier)) {
            alert(`Duplicate channel name: ${pParameters.identifier}`)
            return
        }

        var newChannel = new Channel(pParameters);
        this.sequence.addChannel(newChannel);
        this.draw()
    }

    draw() {
        if (!this.surface) {
            throw new Error("Svg surface not attached!")
        }

        this.surface.size(`${this.sequence.width}px`, `${this.sequence.height}px`)
        this.sequence.draw(this.surface);
        this.syncExternal();
    }


    // ---- Form interfaces ----
    public submitElement(parameters: ElementBundle, type: ElementTypes): Visual {
        console.log("submitted element")
        console.log(parameters)

        var element: Visual;
        switch (type) {
            case "abstract":
                throw new Error("Cannot instantiate abstract object")
                break;
            case "channel":
                this.channel(parameters)
                break;
            case "rect":
            case "svg":
            case "labelled":
                element = this.createElement(parameters, type)
                return element
                break;
            default:
                throw new Error(`Unexpected element type "${type}"`)
        }

        throw new Error("Could not create element")
    }

    public submitModifyElement(parameters: IVisual, type: ElementTypes, target: Visual): Visual {
        console.log("Submitted element modification")
        console.log(parameters)

        var mountConfigCopy: IMountConfig | undefined = target.mountConfig
        // Delete element
        this.deleteElement(target)

        // Copy hidden parameter channelName
        if (mountConfigCopy !== undefined && parameters.mountConfig !== undefined) {
            parameters.mountConfig.channelName = mountConfigCopy.channelName; 
        }

        var element: Visual = this.submitElement(parameters, type);

        return element;
    }

    public submitDeleteElement(target: Visual) {
        this.deleteElement(target);
    }
    // ------------------------

    public addElementFromTemplate(pParameters: RecursivePartial<ElementBundle>, elementRef: string) {
        var positionalType = SequenceHandler.positionalTypes[elementRef];

        var element: Visual;

        switch (positionalType.name) {
            case (SVGElement.name):
                element = new SVGElement(pParameters, elementRef)
                
                if (pParameters.labels !== undefined) {
                    element = new Labellable<SVGElement>(pParameters, element as SVGElement) 
                }

                break;
            case (RectElement.name):
                element = new RectElement(pParameters, elementRef)
                if (pParameters.labels !== undefined) {
                    element = new Labellable<RectElement>(pParameters, element as RectElement) 
                }
                break;
            default:
                throw new Error("error 1")
        }

        // if (element.mountConfig !== undefined) {
        //     this.mountElement(element, element.mountConfig)
        // }

        this.sequence.addElement(element);
    }

    public createElement(parameters: ElementBundle, type: ElementTypes): Visual {
        var element: Visual;

        switch (type) {
            case "svg":
                element = new SVGElement(parameters)
                
                if (parameters.labels !== undefined) {
                    element = new Labellable<SVGElement>(parameters, element as SVGElement) 
                }

                break;
            case "rect":
                element = new RectElement(parameters)
                if (parameters.labels !== undefined) {
                    element = new Labellable<RectElement>(parameters, element as RectElement) 
                }
                break;
            default:
                throw new Error(`Cannot create requested element type ${type}`)
        }

        

        if (element.mountConfig !== undefined) {
            this.mountElement(element)
        } else {
            this.sequence.addElement(element);
        }

        return element;
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

    public deleteElementByID(targetId: ID) {
        var target: Visual | undefined = this.identifyElement(targetId);
        if (target === undefined) {
            return
        }
        this.deleteElement(target);
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
    
    public mountElementFromTemplate(pParameters: RecursivePartial<IVisual & ILabellable>, elementRef: string, insert: boolean=false) {
        var positionalType = SequenceHandler.positionalTypes[elementRef];

        var element: Visual;


        switch (positionalType.name) {
            case (SVGElement.name):
                element = new SVGElement(pParameters, elementRef)
                
                if (pParameters.labels !== undefined) {
                    element = new Labellable<SVGElement>(pParameters, element as SVGElement) 
                }

                break;
            case (RectElement.name):
                element = new RectElement(pParameters, elementRef)
                if (pParameters.labels !== undefined) {
                    element = new Labellable<RectElement>(pParameters, element as RectElement) 
                }
                break;
            default:
                throw new Error("error 1")
        }

        
        this.sequence.mountElement(element, insert);
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