import { Svg } from "@svgdotjs/svg.js";
import defaultLine from "./default/line.json";
import { UserComponentType } from "./diagramHandler";
import LineLike, { ILineLike } from "./lineLike";
import { FillObject, RecursivePartial } from "./util";



export interface ILine extends ILineLike {
    style: lineStyle;
}

interface lineStyle {
    stroke: string,
    thickness: number,
    dashing: [number, number]
}


export class Line extends LineLike {
    static defaults: {[name: string]: ILine} = {"default": <ILine>defaultLine}
    static ElementType: UserComponentType = "line"
    get state(): ILine { return {
        style: this.style,
        ...super.state
    }}

    style: lineStyle;

    constructor(params: RecursivePartial<ILine>, templateName: string="default") {
        var fullParams: ILine = FillObject(params, Line.defaults[templateName]);
        super(fullParams)

        this.style = fullParams.style;
        this.padding = [0, 0, 0, 0]
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