import { Svg, SVG } from "@svgdotjs/svg.js";
import { Drawable } from "./drawable";
import { labelable } from "./temporal";
import * as defaultSection from "./default/data/section.json"
import Label, { labelInterface, Position } from "./label";
import { UpdateObj } from "./util";
import Bracket, { bracketInterface } from "./bracket";


export enum bracketType {
    curly="curly",
    square="square"
}

export enum Direction {
    down="down",
    up="up",
    left="left",
    right="right",
}

export interface sectionInterface extends bracketInterface {
    timespan?: number[],
}

export default class Section extends Bracket implements labelable {
    static defaults: {[key: string]: sectionInterface} = {"section": {...<any>defaultSection}}

    public static anyArgConstruct(defaultArgs: sectionInterface, args: sectionInterface): Bracket {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        return new Section(
            {protrusion: options.protrusion,
             adjustment: options.adjustment,
             style: options.style,
             label: options.label,
             timespan: options.timespan}
        )
    }


    timespan?: number[];

    constructor(params: sectionInterface,
                offset: number[]=[-1, 0]) {

        super(params, offset)
            
        this.timespan = params.timespan;
    }


}