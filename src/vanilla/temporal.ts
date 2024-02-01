import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'

export enum Orientation { Top="top", Bottom="bottom", Both="both" }
export const orientationEval: {[name: string]: Orientation} = {
    "top": Orientation.Top,
    "bottom": Orientation.Bottom,
    "both": Orientation.Both
}

export interface temporalInterface {
    orientation: Orientation,
    padding: number[],
    style: temporalStyle,
}

export interface temporalStyle {
    width: number,
    height: number,
}

Orientation.Both.toString()

export default abstract class Temporal extends Drawable {
    // An element that relates to a point in time
    timestamp: number;
    orientation: Orientation;

    padding: number[];
    width: number;
    height: number;

    style: temporalStyle;

    constructor(timestamp: number,
                orientation: Orientation,
                padding: number[],
                style: temporalStyle,
                offset: number[]=[0, 0]) {

        super(0, 0, offset);

        this.timestamp = timestamp;
        this.orientation = orientation;

        this.padding = padding;

        this.style = style;
        this.width = style.width;
        this.height = style.height;
    }

    verticalProtrusion(channelThickness: number) : number[] {
        switch (this.orientation) {
            case Orientation.Top:
                return [this.height, 0];

            case Orientation.Bottom:
                return [0, this.height];

            case Orientation.Both:
                return [this.height - channelThickness/2, 
                this.height - channelThickness/2];
        }
    }

    positionVertically(y: number, channelThickness: number) : number[] {
        console.log("Positioning type:");
        console.log(typeof this)
        console.log(this.orientation);

        var protrusion = this.verticalProtrusion(channelThickness); 
        
        switch (this.orientation) {
            case Orientation.Top:
                this.y = y - this.height;
                break;

            case Orientation.Bottom:
                this.y = y + channelThickness;
                break;

            case Orientation.Both:
                this.y = y + channelThickness/2 - this.height/2;
                break;
        }

       return protrusion;
    }
}