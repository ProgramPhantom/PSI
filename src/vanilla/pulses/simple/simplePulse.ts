import Temporal, {Orientation, temporalInterface, labelable, temporalConfig, Alignment} from "../../temporal";
import * as SVG from '@svgdotjs/svg.js'
import SVGPulse from "../image/svgPulse";
import Label, { Position, labelInterface } from "../../label";
import {UpdateObj} from "../../util";
import {simplePulses} from "../../default/data/simplePulse"
import '@svgdotjs/svg.draggable.js';
import { Rect } from "@svgdotjs/svg.js";

export interface simplePulseInterface extends temporalInterface {
    style: simplePulseStyle,
}
export interface simplePulseStyle {
    width: number,
    height: number,
    fill: string,
    stroke: string,  // Optional
    strokeWidth: number
}



export default class SimplePulse extends Temporal  {
    // Default is currently 180 Pulse
    static defaults: {[key: string]: simplePulseInterface} = {...<any>simplePulses}
    
    // A pulse that is an svg rect
    style: simplePulseStyle;
    
    static anyArgConstruct(defaultArgs: simplePulseInterface, args: simplePulseInterface): SimplePulse {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        var el = new SimplePulse(options.timestamp,
                                {config: options.config,
                                 padding: options.padding,
                                 style: options.style,
                                 labelOn: options.labelOn,
                                 label: options.label,
                                 arrowOn: options.arrowOn,
                                 arrow: options.arrow})

        return el;
    }

    constructor(timestamp: number, 
                params: simplePulseInterface,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              params,
              offset);
        
        this.style = params.style;

        this.bounds = {width: this.style.width, height: this.style.height};
        this.actualBounds = {
            width: this.bounds.width + this.padding[1] + this.padding[3],
            height: this.bounds.height + this.padding[0] + this.padding[2]
        }
    }

    draw(surface: SVG.Svg) {
        var rect = surface.rect(this.width, this.height)
        .attr({fill: this.style.fill,
                stroke: this.style.stroke})
        .move(this.x, this.y)
        // BAD FIX
        .attr({"stroke-width": this.style.strokeWidth,
               "shape-rendering": "crispEdges"
        });

        rect.draggable();

        if (this.arrow || this.label) {
            this.posDrawDecoration(surface)
        }
    }

    goToStart(el: Rect) {
        el.move(this.x, this.y);
    }

    verticalProtrusion(channelThickness: number) : number[] {
        // Differs to Temporal due to the stroke width interferring.
        var dimensions: number[] = [];

        switch (this.config.orientation) {
            case Orientation.top:
                var actualHeight = this.height;
                if (this.style.strokeWidth) {
                    actualHeight -= this.style.strokeWidth!/2;
                }
                
                dimensions = [actualHeight, 0];
                break;

            case Orientation.bottom:
                var actualHeight = this.height;
                if (this.style.strokeWidth) {
                    actualHeight += this.style.strokeWidth!/2;
                }

                dimensions = [0, actualHeight];
                break;

            case Orientation.both: // LOOK AT THIS
                var actualHeight = this.height/2 - channelThickness/2;
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
                this.y = y - this.height;
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
                this.y = y + channelThickness/2 - this.height/2

                if (this.style.strokeWidth) {
                    this.y = this.y;
                }
                break;
        }
    
        return protrusion;
    }

}

