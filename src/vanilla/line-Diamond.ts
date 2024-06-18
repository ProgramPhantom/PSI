import { Element, IElement } from "./element";
import * as defaultLine from "./default/data/line.json";
import { FillObject } from "./util";
import LineElement, { ILineLike } from "./lineElement";
import { Svg } from "@svgdotjs/svg.js";


export interface ILine extends ILineLike {
    style: lineStyle;
}

interface lineStyle {
    stroke: string,
    strokeWidth: number,
    dashing: [number, number]
}


export class Line extends LineElement {
    static defaults: {[name: string]: ILine} = {"default": <ILine>defaultLine}

    style: lineStyle;

    constructor(params: Partial<ILine>, templateName: string="default") {
        var fullParams: ILine = FillObject(params, Line.defaults[templateName]);
        super(fullParams)

        this.style = fullParams.style;
    }

    draw(surface: Svg, ...args: any[]): void {
        
    }  // Change this
}