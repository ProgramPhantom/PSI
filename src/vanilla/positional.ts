import { Element, IElement } from "./element";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Label, { ILabel, Position } from "./label";
import { FillObject, PartialConstruct, UpdateObj } from "./util";
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
export default class Positional<T = Element> {
    static defaults: {[name: string]: IPositional} = {"default": <any>defaultPositional}
    
    config: IConfig;
    element: T;

    constructor(object: T, params: Partial<IPositional>, defaults: IPositional) {
        var fullParams: IPositional = FillObject(params, defaults);
        
        this.element = object;
        this.config = {...fullParams.config};
    }
}