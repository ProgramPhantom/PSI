import { Visual, IElement } from "./visual";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Label, { ILabel, Position } from "./label";
import { FillObject, PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import Arrow, { ArrowPosition, IArrow } from "./arrow";
import { H } from "mathjax-full/js/output/common/FontData";
import Annotation, { IAnnotation } from "./annotation";
import PaddedBox, { IPaddedBox } from "./paddedBox";
import defaultPositional from "./default/data/positional.json";
import RectElement, { IRect } from "./rectElement";

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

export enum Alignment {Left=<any>"left", Centre=<any>"centre", Right=<any>"right", Padded=<any>"padded"}

export interface labelable {
    label?: Label,
    posDrawDecoration(surface: Svg): number[],
}

interface IConfig {
    index?: number, 

    orientation: Orientation,
    alignment: Alignment,
    overridePad: boolean
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

    constructor(object: T, params: RecursivePartial<IPositional>, defaults: IPositional) {
        var fullParams: IPositional = FillObject(params, defaults);
        
        this.element = object;
        this.config = {...fullParams.config};
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