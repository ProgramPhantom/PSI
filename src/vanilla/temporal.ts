import { Drawable } from "./drawable";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import Label, { labelInterface, Position } from "./label";
import { UpdateObj } from "./util";
import Arrow, { ArrowPosition, arrowInterface } from "./arrow";
import { H } from "mathjax-full/js/output/common/FontData";

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
    orientation: Orientation,
    alignment: Alignment,
    overridePad: boolean
    inheritWidth: boolean,
    noSections: number,
}

export interface temporalInterface {
    padding: number[],
    config: temporalConfig,
    labelOn: boolean,
    arrowOn: boolean,

    label: labelInterface,
    arrow: arrowInterface,
}



export default abstract class Temporal extends Drawable implements labelable {
    // An element that relates to a point in time
  
    timestamp: number | number[];
    config: temporalConfig;

    barThickness: number = 3;

    labelOn: boolean;
    label?: Label;
    arrowOn: boolean;
    arrow?: Arrow;

    constructor(timestamp: number,
                params: temporalInterface,
                offset: number[]=[0, 0]) {

        super(0, 0, offset, params.padding);

        this.timestamp = timestamp;

        this.config = params.config;

        this.labelOn = params.labelOn;
        this.arrowOn = params.arrowOn;

        if (params.labelOn) {
            this.label = Label.anyArgConstruct(Label.defaults["label"], params.label);
        }
        if (params.arrowOn) {
            this.arrow = Arrow.anyArgConstruct(Arrow.defaults["arrow"], params.arrow)
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

        if (this.label) {
            switch (this.label.position) {
                case Position.top:
                    dimensions[0] += this.label.pheight;
                    break;
                case Position.bottom:
                    dimensions[1] += this.label.pheight;
                    break;
                case Position.centre:
                    // No protrusion
                    break;
                default:
                    dimensions[0] += this.label.pheight;

            }
        }

        if (this.arrow) {
            if (this.arrow.position === ArrowPosition.top) {
                dimensions[0] += this.arrow.pheight;
                console.warn("this might not work")
            } else if (this.arrow.position === ArrowPosition.bottom) {
                dimensions[1] += this.arrow.pheight;
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

    addLabel(args: labelInterface) {
        this.label = Label.anyArgConstruct(Label.defaults["label"], args);
    }

    posDrawDecoration(surface: Svg, ): number[] {
        var width = 0;
        var height = 0;
        var labelX, labelY = 0;
        var level;
        

        if (this.label) {
            switch (this.label.position) {
                case Position.top:
                    labelX = this.x + this.width/2 - this.label.width/2;
                    labelY = this.y - this.label.height - this.label.padding[2];
                    break;
                case Position.bottom:
                    labelX = this.x + this.width/2 - this.label.width/2;
                    labelY = this.y + this.height + this.label.padding[0] + this.barThickness;
                    break;

                case Position.centre:
                    labelX = this.x + this.width/2 - this.label.width/2;
                    labelY = this.y + this.height /2 - this.label.height/2 + this.label.padding[0];

                    break;
                default:
                    labelX = 0;
                    labelY = 0;
            }

            width += this.label.width
            height += this.label.height;
        }

        if (this.arrow) {
            switch (this.arrow.position) {
                case ArrowPosition.top:
                    level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    this.arrow.set(this.x, level, this.x + this.width, level);
                    height += this.arrow.pheight;

                    if ((this.label !== undefined) && this.label.position === Position.top) {
                        labelY -= this.arrow.pheight;
                    }
                    break;
                case ArrowPosition.inline:
                    if (this.label) {
                        this.label.style.background = "white";
                        level = labelY + this.label.height/2;
                    } else {
                        level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    }
                    
                    this.arrow.set(this.x, level, this.x + this.width, level);
                    break;
                case ArrowPosition.bottom:
                    level = this.y + this.height + this.arrow.padding[0] + this.barThickness + this.arrow.style.thickness;
                    this.arrow.set(this.x, level, this.x + this.width, level);

                    if ((this.label !== undefined) && this.label.position === Position.bottom) {
                        labelY += this.arrow.pheight;
                    }

                    break;
                default:
                    throw new Error(`Unknown arrow position '${this.arrow.position}'`)
            }

            this.arrow.draw(surface);
        }

        if (this.label) {
            console.log("DRAWWING")
            this.label.move(labelX, labelY);
            this.label.draw(surface);
        }


        return [width, height];
    }



    centreXPos(x: number) {
        this.x = x - this.width/2;
    }

}