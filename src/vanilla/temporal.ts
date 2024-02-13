import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Label, { labelInterface, LabelPosition } from "./label";

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

export enum Orientation { top="top", bottom="bottom", both="both" }

export enum Alignment {Left="left", Centre="centre", Right="right"}




export interface temporalConfig {
    orientation: Orientation,
    alginment: Alignment,
    overridePad: boolean
    inheritWidth: boolean,
}

export interface labelable {
    label?: Label,
    drawLabel(surface: Svg): number[],
}


export interface temporalInterface {
    config: temporalConfig,
    padding: number[],
    label?: labelInterface | null
}



export default abstract class Temporal extends Drawable implements labelable {
    // An element that relates to a point in time
    timestamp: number;
    config: temporalConfig;

    padding: number[];

    label?: Label;

    private _actualBounds?: Bounds;

    constructor(timestamp: number,
                config: temporalConfig,
                padding: number[],
                offset: number[]=[0, 0],
                label?: labelInterface,
                dim?: {width: number, height: number}) {

        super(0, 0, offset);

        this.timestamp = timestamp;

        this.config = config;
        this.padding = padding;

        
        if (label) {
            this.label = Label.anyArgConstruct(label);
        }
        if (dim) {
            this.bounds = dim;
            this.actualBounds = {
                width: dim.width + padding[1] + padding[3],
                height: dim.height + padding[0] + padding[2]
            }
        }
    }

    verticalProtrusion(channelThickness: number) : number[] {
        var dimensions: number[] = [];

        switch (this.config.orientation) {
            case Orientation.top:
                dimensions = [this.height, 0];
                break;

            case Orientation.bottom:
                dimensions = [0, this.height];
                break;

            case Orientation.both:
                dimensions = [this.height/2 - channelThickness/2, 
                this.height/2 - channelThickness/2];    
                break;

            default:
                console.error("UNKNOWN ORIENTATION: ", this.config.orientation)
        }

      
        var labelPro = this.labelVerticalProtrusion(channelThickness);  // 0, 0 if no label
        dimensions[0] += labelPro[0];
        dimensions[1] += labelPro[1];
        
        return dimensions;
    }

    labelVerticalProtrusion(channelThickness: number): number[] {
        // Above, below
        var dimensions: number[] = [0, 0];

        if (this.label) {
            switch (this.label.labelPosition) {
                case LabelPosition.top:
                    dimensions[0] += this.label.height + this.label.padding[0] + this.label.padding[2];
                    break;
                case LabelPosition.bottom:
                    dimensions[1] += this.label.height + this.label.padding[0] + this.label.padding[2];
                    break;
                case LabelPosition.centre:
                    
                    break;
                default:
                    throw new Error("NOT IMPLEMENTED");
            }
            
        }

        return dimensions;
    }

    positionVertically(y: number, channelThickness: number) : number[] {
        
        
        console.log("POS", typeof this.config.orientation)

        var protrusion = this.verticalProtrusion(channelThickness); 
        
        switch (this.config.orientation) {
            case Orientation.top:
                console.log("TOP")
                this.y = y - this.height;
                break;

            case Orientation.bottom:
                this.y = y + channelThickness;

                break;

            case Orientation.both:
                this.y = y + channelThickness/2 - this.height/2;
                console.log("DEFAULTING")
                break;
        }

       return protrusion;
    }

    addLabel(args: labelInterface) {
        this.label = Label.anyArgConstruct(args);
    }

    drawLabel(surface: Svg): number[] {
        // LIMITATION: top pad does not start from the bottom of the channel bar
        
        if (this.label) {
            var x, y;
            
            switch (this.label.labelPosition) {
                

                case LabelPosition.top:
                    x = this.x + this.width/2 - this.label.width/2;
                    y = this.y - this.label.height - this.label.padding[2];
                    break;
                case LabelPosition.bottom:
                    x = this.x + this.width/2 - this.label.width/2;
                    y = this.y + this.height + this.label.padding[0];
                    break;

                case LabelPosition.centre:
                        x = this.x + this.width/2 - this.label.width/2;
                        y = this.y + this.height /2 - this.label.height/2 + this.label.padding[0];
    
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

    centreXPos(x: number) {
        this.x = x - this.width/2;
    }

    get actualBounds(): Bounds {
        if (this._actualBounds) {
            return this._actualBounds;
        }
        throw new Error("Element has no dimensions");
    }
    set actualBounds(b: Dim)  {
        var top = this.y;
        var left = this.x;

        var bottom = this.y + b.height;
        var right = this.x + b.width;


        this._actualBounds = {top: top, right: right, bottom: bottom, left: left, width: b.width, height: b.height};
    }

    get actualWidth(): number {
        if (this._actualBounds) {
            return this._actualBounds.width;
        }
        throw new Error("Dimensions undefined")
    }
    get actualHeight(): number {
        if (this._actualBounds) {
            return this._actualBounds.height;
        }
        throw new Error("Dimensions undefined")
    }
}