import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Label, { labelInterface } from "./label";

export enum Orientation { Top="top", Bottom="bottom", Both="both" }
export const orientationEval: {[name: string]: Orientation} = {
    "top": Orientation.Top,
    "bottom": Orientation.Bottom,
    "both": Orientation.Both
}


export enum LabelPosition {Top="top",
                           Right="right",
                           Bottom="bottom",
                           Left="left"}
export const positionEval: {[name: string]: LabelPosition} = {
    "top": LabelPosition.Top,
    "right": LabelPosition.Right,
    "bottom": LabelPosition.Bottom,
    "left": LabelPosition.Left
}

export interface labelable {
    label?: Label,
    labelPosition: LabelPosition,
    drawLabel(surface: Svg): number[],
}



export interface temporalInterface {
    orientation: Orientation,
    labelPosition: LabelPosition,

    padding: number[],
    style: temporalStyle,
    label: labelInterface
}

export interface temporalStyle {
    width: number,
    height: number,
}

Orientation.Both.toString()

export default abstract class Temporal extends Drawable implements labelable {
    // An element that relates to a point in time
    timestamp: number;
    orientation: Orientation;

    padding: number[];
    width: number;
    height: number;

    style: temporalStyle;
    label?: Label;
    labelPosition: LabelPosition;

    constructor(timestamp: number,
                orientation: Orientation,
                labelPosition: LabelPosition,
                padding: number[],
                style: temporalStyle,
                label: labelInterface,
                offset: number[]=[0, 0], ) {

        super(0, 0, offset);

        this.timestamp = timestamp;
        this.orientation = orientation;

        this.padding = padding;

        this.style = style;
        this.width = style.width;
        this.height = style.height;

        this.label = Label.anyArgConstruct(label);
        this.labelPosition = labelPosition;
    }

    verticalProtrusion(channelThickness: number) : number[] {
        var dimensions = [];

        switch (this.orientation) {
            case Orientation.Top:
                dimensions = [this.height, 0];
                break;

            case Orientation.Bottom:
                dimensions = [0, this.height];
                break;

            case Orientation.Both:
                dimensions = [this.height - channelThickness/2, 
                this.height - channelThickness/2];
                break;
        }

        if (this.label) {
            dimensions[0] += this.label.height + this.label.padding[0]+ this.label.padding[2];
        }

        return dimensions;
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

    addLabel(args: labelInterface) {
        this.label = Label.anyArgConstruct(args);
    }

    drawLabel(surface: Svg): number[] {
        if (this.label) {
            var x, y;

            switch (this.labelPosition) {
                case LabelPosition.Top:
                    x = this.x + this.width/2 - this.label.width/2;

                    y = this.y - this.label.height - this.label.padding[2];
                    break;
                default:
                    x = 0;
                    y = 0;
            }


            this.label.position(x, y);
            this.label.draw(surface);

            return [this.label.width, this.label.height];
        }

        return [0, 0];
    }

}