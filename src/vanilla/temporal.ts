import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Label, { labelInterface, Position } from "./label";
import { UpdateObj } from "./util";
import Arrow, { ArrowPosition, arrowInterface } from "./arrow";
import { H } from "mathjax-full/js/output/common/FontData";
import SpanningLabel, { spanningLabelInterface } from "./spanningLabel";

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

export enum Orientation { top=<any>"top", bottom=<any>"bottom", both=<any>"both" }

export enum Alignment {Left=<any>"left", Centre=<any>"centre", Right=<any>"right"}

export interface IHasAssembler {
    anyArgConstruct(defaultArgs: temporalInterface, args: any): object;
}
export interface labelable {
    label?: Label,
    posDrawDecoration(surface: Svg): number[],
}

export interface temporalConfig {
    timestamp?: number[],

    orientation: Orientation,
    alignment: Alignment,
    overridePad: boolean
    inheritWidth: boolean,
    noSections: number,
}

export interface temporalInterface extends spanningLabelInterface{
    padding: number[],
    offset: number[],
    config: temporalConfig,

}



export default abstract class Temporal extends Drawable {
    // An element that relates to a point in time
  
    private _timestamp?: number[];

    config: temporalConfig;

    barThickness: number = 3;

    decoration: SpanningLabel;

    constructor(params: temporalInterface) {

        super(0, 0, params.offset, params.padding);


        this.config = params.config;

        if (this.config.timestamp) {
            this.timestamp = this.config.timestamp;
        }

        this.decoration = SpanningLabel.anyArgConstruct(SpanningLabel.defaults["spanlabel"], 
                          {labelOn: params.labelOn, label: params.label, arrowOn: params.arrowOn, arrow: params.arrow})
        
    }

    verticalProtrusion(channelThickness: number) : number[] {
        var dimensions: number[] = [];

        switch (this.config.orientation) {
            case Orientation.top:
                dimensions = [this.pheight, 0];
                break;

            case Orientation.bottom:
                dimensions = [0, this.pheight];
                break;

            case Orientation.both:
                dimensions = [this.pheight/2 - channelThickness/2, 
                this.pheight/2 - channelThickness/2];    
                break;

            default:
                throw Error(`Unknown orientation: '${this.config.orientation}'`)
        }

      
        var labelPro = this.labelVerticalProtrusion(channelThickness);  // 0, 0 if no label
        dimensions[0] += labelPro[0];
        dimensions[1] += labelPro[1];
        
        return dimensions;
    }

    labelVerticalProtrusion(channelThickness: number): number[] {
        // top, below
        var dimensions: number[] = [0, 0];
        channelThickness

        if (this.decoration.label) {
            switch (this.decoration.label.position) {
                case Position.top:
                    dimensions[0] += this.decoration.label.pheight;
                    break;
                case Position.bottom:
                    dimensions[1] += this.decoration.label.pheight;
                    break;
                case Position.centre:
                    // No protrusion
                    break;
                default:
                    dimensions[0] += this.decoration.label.pheight;

            }
        }

        if (this.decoration.arrow) {
            if (this.decoration.arrow.position === ArrowPosition.top) {
                dimensions[0] += this.decoration.arrow.pheight;
                console.warn("this might not work")
            } else if (this.decoration.arrow.position === ArrowPosition.bottom) {
                dimensions[1] += this.decoration.arrow.pheight;
                console.warn("this might not work")
            }
        }

        return dimensions;
    }

    positionVertically(y: number, channelThickness: number) : number[] {
        // CALCULATES Y OF TEMPORAL

        var protrusion = this.verticalProtrusion(channelThickness); 
        
        switch (this.config.orientation) {
            case Orientation.top:
                this.py = y - this.pheight;
                break;

            case Orientation.bottom:
                this.py = y + channelThickness;
                break;

            case Orientation.both:
                this.y = y + channelThickness/2 - this.height/2;
                
                break;
        }

       return protrusion;
    }

    positionDecoration() {
    
        
        
        if (this.decoration.arrowOn && this.decoration.arrow) {
            this.decoration.arrow.set(0, 0, this.width, 0);
            this.decoration.computeDimensions();
            this.decoration.px = this.px + this.pwidth/2 - this.decoration.width/2;

            switch (this.decoration.arrow.position) {
                case ArrowPosition.top:
                    this.decoration.py = this.py - this.decoration.pheight;
                    break;
                case ArrowPosition.bottom:
                    this.decoration.py = this.py + this.height + this.barThickness;
                    break;
                default:
                    console.warn("Inline not allowed when no label")
                    this.decoration.py = this.py - this.decoration.pheight;
                    break;
            }
        }

        if (this.decoration.labelOn && this.decoration.label) {
            this.decoration.px = this.px + this.pwidth/2 - this.decoration.width/2;
            
            switch (this.decoration.label.position) {
                case Position.top:
                    this.decoration.py = this.py - this.decoration.pheight;
                    break;
                case Position.bottom:
                    this.decoration.py = this.y + this.height + this.barThickness;
                    break;
                case Position.centre:
                    this.decoration.y = this.y + this.height/2 - this.decoration.height/2;
                    break;
            }
        }
    }

    centreXPos(x: number) {
        this.x = x - this.width/2;
    }

    get timestamp(): number[] {
        if (this._timestamp !== undefined) {
            return this._timestamp;
        }
        throw new Error("Timestamp not initialised")
    }
    set timestamp(t: number[]) {
        this._timestamp = t;
    }
}