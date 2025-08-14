import { Visual, IVisual } from "./visual";
import defaultLine from "./default/data/line.json";
import { FillObject, RecursivePartial } from "./util";
import { ILineLike } from "./lineLike";
import { Svg } from "@svgdotjs/svg.js";
import LineLike from "./lineLike";


export interface ILine extends ILineLike {
    style: lineStyle;
}

interface lineStyle {
    stroke: string,
    strokeWidth: number,
    dashing: [number, number]
}


export class Line extends LineLike {
    static defaults: {[name: string]: ILine} = {"default": <ILine>defaultLine}
    get state(): ILine { return {
        x: this._x,
        y: this._y,
        contentWidth: this._contentWidth,
        contentHeight: this._contentHeight,
        padding: this.padding,
        offset: this.offset,
        ref: this.ref,
        style: this.style,
        adjustment: this.adjustment,
        orientation: this.orientation
    }}

    style: lineStyle;

    constructor(params: RecursivePartial<ILine>, templateName: string="default") {
        var fullParams: ILine = FillObject(params, Line.defaults[templateName]);
        super(fullParams)

        this.style = fullParams.style;
    }

    draw(surface: Svg): void {
        if (this.dirty) {
            // Clear old svg
            if (this.svg) {
                this.svg.remove();
            }

            
            this.svg = surface.line(this.x, this.y, this.x2, this.y2).attr({
                "stroke": this.style.stroke
            })
        }
    } 
}