import { Visual, IVisual } from "./visual";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Label, { ILabel, Position } from "./label";
import { FillObject, PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import Arrow, { ArrowPosition, IArrow } from "./arrow";
import { H } from "mathjax-full/js/output/common/FontData";
import Annotation, { IAnnotation } from "./annotation";
import PaddedBox, { IPaddedBox } from "./paddedBox";
import defaultPositional from "./default/data/positional.json";
import RectElement, { IRect } from "./rectElement";
import Channel from "./channel";

interface Dim {
    width: number,
    height: number
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number

    width: number,
    height: number,
}

type Index = [number, number]

export enum Orientation { top=<any>"top", bottom=<any>"bottom", both=<any>"both" }

export enum Alignment { here=<any>"here", centre=<any>"centre", far=<any>"far", none=<any>"none" }


export interface labelable {
    label?: Label,
    posDrawDecoration(surface: Svg): number[],
}

export interface IConfig {
    index?: number, 

    orientation: Orientation,
    alignment: Alignment,
    inheritWidth: boolean,
    noSections: number,
}

export interface IPositional {
    config: IConfig
}





                                    // Has default construct
export default class Positional<T extends Visual> {
    static defaults: {[name: string]: IPositional} = {"default": <any>defaultPositional}
    
    config: IConfig;
    element: T;

    channel: Channel;
    index: number | undefined;

    constructor(object: T, channel: Channel, params: RecursivePartial<IPositional>, defaults: IPositional=Positional.defaults["default"]) {
        var fullParams: IPositional = FillObject(params, defaults);
        
        this.element = object;
        this.config = {...fullParams.config};

        this.channel = channel;

        if (this.config.orientation === Orientation.bottom) {
            this.element.verticalFlip();
        }
    }

    draw(surface: Svg) {
        this.element.draw(surface);
    }

    set x(val: number) {
        if (val !== this.element.x) {
            this.element.dirty = true;
            this.element.x = val;
            this.element.enforceBinding();
        }
    }  // OVERRIDING SETTER REQUIRES GETTER TO BE REDEFINED???
    get x(): number {
        if (this.element.x !== undefined) {
            return this.x;
        }
        throw new Error(`x unset in ${this.element.refName, this.config.index}`);
    }
    set y(val: number) {
        if (val !== this.element.y) {
            this.element.dirty = true;
            this.element.y = val;
            this.element.enforceBinding()
        }
    }
    get y(): number {
        if (this.element.y !== undefined) {
            return this.element.y;
        }
        throw new Error(`y unset in ${this.element.refName, this.config.index}` );
    }
}