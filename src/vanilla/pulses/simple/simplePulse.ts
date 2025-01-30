import Positional, {Orientation, IPositional, labelable, positionalConfig, Alignment} from "../../positional";
import * as SVG from '@svgdotjs/svg.js'
import SVGPulse from "../image/svgPulse";
import Text, { Position, IText } from "../../label";
import {FillObject, UpdateObj} from "../../util";
import {simplePulses} from "../../default/data/simplePulse"
import '@svgdotjs/svg.draggable.js';
import { Rect } from "@svgdotjs/svg.js";
import { IDraw } from "../../element";

export interface ISimplePulse extends IPositional {
    style: simplePulseStyle,
}
export interface simplePulseStyle {
    width: number,
    height: number,
    fill: string,
    stroke: string,  // Optional
    strokeWidth: number
}



export default class SimplePulse extends Positional implements IDraw {
    // Default is currently 180 Pulse
    static defaults: {[key: string]: ISimplePulse} = {...<any>simplePulses}
    
    // A pulse that is an svg rect
    style: simplePulseStyle;

    constructor(params: Partial<ISimplePulse>, templateName: string="pulse90") {
        var fullParams: ISimplePulse = FillObject(params, SimplePulse.defaults[templateName])
        super(fullParams);
        
        this.style = fullParams.style;
    }

    resolveDimensions(): void {
        this.contentDim = {width: this.style.width, height: this.style.height};
    }

    draw(surface: SVG.Svg) {
        var rect = surface.rect(this.contentWidth, this.contentHeight)
        .attr({fill: this.style.fill,
                stroke: this.style.stroke})
        .move(this.x + this.offset[0], this.y + this.offset[1])
        // BAD FIX
        .attr({"stroke-width": this.style.strokeWidth,
               "shape-rendering": "crispEdges"
        });

        // rect.draggable();

        if (this.decoration.arrow || this.decoration.label) {
            this.positionDecoration()
            this.decoration.draw(surface)
        }
    }

    goToStart(el: Rect) {
        el.move(this.x, this.y);
    }

    verticalProtrusion(channelThickness: number) : number[] {
        // Differs to Positional due to the stroke width interferring.
        var dimensions: number[] = [];

        switch (this.config.orientation) {
            case Orientation.top:
                var actualHeight = this.contentHeight;
                if (this.style.strokeWidth) {
                    actualHeight -= this.style.strokeWidth!/2;
                }
                
                dimensions = [actualHeight, 0];
                break;

            case Orientation.bottom:
                var actualHeight = this.contentHeight;
                if (this.style.strokeWidth) {
                    actualHeight += this.style.strokeWidth!/2;
                }

                dimensions = [0, actualHeight];
                break;

            case Orientation.both: // LOOK AT THIS
                var actualHeight = this.contentHeight/2 - channelThickness/2;
                if (this.style.strokeWidth) {
                    actualHeight += this.style.strokeWidth!/2;
                }

                dimensions = [actualHeight, actualHeight];
                break;
        }


        var labelPro = this.labelVerticalProtrusion(channelThickness);
        dimensions[0] += labelPro[0];
        dimensions[1] += labelPro[1];

        return dimensions;
    }

    positionVertically(y: number, channelThickness: number): number[] {
        var protrusion = this.verticalProtrusion(channelThickness);

        

        switch (this.config.orientation) {
            case Orientation.top:
                this.y = y - this.contentHeight;
                if (this.style.strokeWidth) {
                    this.y += this.style.strokeWidth!/2;
                }
                break;

            case Orientation.bottom:
                this.y = y + channelThickness;

                if (this.style.strokeWidth) {
                    this.y = this.y - this.style.strokeWidth!/2;
                }
                break;

            case Orientation.both:
                this.y = y + channelThickness/2 - this.contentHeight/2

                if (this.style.strokeWidth) {
                    this.y = this.y;
                }
                break;
        }
    
        return protrusion;
    }

}

