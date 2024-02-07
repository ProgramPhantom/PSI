import { Svg } from "@svgdotjs/svg.js";
import Arrow, { arrowStyle } from "./arrow";
import { labelInterface } from "./label";
import Temporal, { LabelPosition, Orientation, labelable } from "./temporal";


export default class Span extends Temporal implements labelable {
    arrow: Arrow;

    spanWidth: number;

    constructor(timestamp: number,
                width: number,
                orientation: Orientation, 
                labelPosition: LabelPosition, 
                padding: number[], 
                arrowStyle: arrowStyle, 
                label?: labelInterface, 
                offset: number[]=[0,0],) {
        super(timestamp, orientation, labelPosition, padding, offset, label,)

        this.spanWidth = width;
        this.arrow = new Arrow(10, 10, 50, 50, arrowStyle)
    }

    public draw(surface: Svg): void {
        this.arrow.draw(surface);

        if (this.label) {
            this.label.draw(surface);
        }
    }
}