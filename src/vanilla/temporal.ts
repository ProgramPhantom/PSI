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
    timestamp?: number | number[],

    orientation: Orientation,
    alignment: Alignment,
    overridePad: boolean
    inheritWidth: boolean,
    noSections: number,
}

export interface temporalInterface extends spanningLabelInterface{
    padding: number[],
    config: temporalConfig,

}



export default abstract class Temporal extends Drawable {
    // An element that relates to a point in time
  
    private _timestamp?: number | number[];

    config: temporalConfig;

    barThickness: number = 3;

    decoration: SpanningLabel;

    constructor(params: temporalInterface,
                offset: number[]=[0, 0]) {

        super(0, 0, offset, params.padding);


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
        var protrusion = this.verticalProtrusion(channelThickness); 
        
        switch (this.config.orientation) {
            case Orientation.top:
                this.y = y - this.height;
                break;

            case Orientation.bottom:
                this.y = y + channelThickness;
                break;

            case Orientation.both:
                this.y = y + channelThickness/2 - this.height/2;
                
                break;
        }

       return protrusion;
    }

    posDrawDecoration(surface: Svg, ): number[] {
        var width = 0;
        var height = 0;
        var labelX, labelY = 0;
        var level;
        

        if (this.decoration.label) {
            switch (this.decoration.label.position) {
                case Position.top:
                    labelX = this.x + this.width/2 - this.decoration.label.width/2;
                    labelY = this.y - this.decoration.label.height - this.decoration.label.padding[2];
                    break;
                case Position.bottom:
                    labelX = this.x + this.width/2 - this.decoration.label.width/2;
                    labelY = this.y + this.height + this.decoration.label.padding[0] + this.barThickness;
                    break;

                case Position.centre:
                    labelX = this.x + this.width/2 - this.decoration.label.width/2;
                    labelY = this.y + this.height /2 - this.decoration.label.height/2 + this.decoration.label.padding[0];

                    break;
                default:
                    labelX = 0;
                    labelY = 0;
            }

            width += this.decoration.label.width
            height += this.decoration.label.height;
        }

        if (this.decoration.arrow) {
            switch (this.decoration.arrow.position) {
                case ArrowPosition.top:
                    level = this.y - this.decoration.arrow.padding[2] - this.decoration.arrow.style.thickness;
                    this.decoration.arrow.set(this.x, level, this.x + this.width, level);
                    height += this.decoration.arrow.pheight;

                    if ((this.decoration.label !== undefined) && this.decoration.label.position === Position.top) {
                        labelY -= this.decoration.arrow.pheight;
                    }
                    break;
                case ArrowPosition.inline:
                    if (this.decoration.label) {
                        this.decoration.label.style.background = "white";
                        level = labelY + this.decoration.label.height/2;
                    } else {
                        level = this.y - this.decoration.arrow.padding[2] - this.decoration.arrow.style.thickness;
                    }
                    
                    this.decoration.arrow.set(this.x, level, this.x + this.width, level);
                    break;
                case ArrowPosition.bottom:
                    level = this.y + this.height + this.decoration.arrow.padding[0] + this.barThickness + this.decoration.arrow.style.thickness;
                    this.decoration.arrow.set(this.x, level, this.x + this.width, level);

                    if ((this.decoration.label !== undefined) && this.decoration.label.position === Position.bottom) {
                        labelY += this.decoration.arrow.pheight;
                    }

                    break;
                default:
                    throw new Error(`Unknown arrow position '${this.decoration.arrow.position}'`)
            }

            if (this.decoration.arrowOn){
                this.decoration.arrow.draw(surface);
            }
            
        }

        if (this.decoration.label && this.decoration.labelOn) {
            this.decoration.label.move(labelX, labelY);
            this.decoration.label.draw(surface);
        }


        return [width, height];
    }

    centreXPos(x: number) {
        this.x = x - this.width/2;
    }

    get timestamp(): number | number[] {
        if (this._timestamp !== undefined) {
            return this._timestamp;
        }
        throw new Error("Timestamp not initialised")
    }
    set timestamp(t: number | number[]) {
        this._timestamp = t;
    }
}