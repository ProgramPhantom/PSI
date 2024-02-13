import Temporal, {Orientation, orientationEval, temporalInterface, labelable} from "../../temporal";
import * as defaultPulse from "../../default/180pulse.json"
import * as SVG from '@svgdotjs/svg.js'
import SVGPulse from "../image/svgPulse";
import Label, { LabelPosition, labelInterface, positionEval } from "../../label";
import {UpdateObj} from "../../util";

export interface simplePulseInterface extends temporalInterface {
    style: simplePulseStyle,
}
export interface simplePulseStyle {
    width: number,
    height: number,
    fill: string,
    stroke?: string | null,  // Optional
    strokeWidth?: number | null
}



export default class SimplePulse extends Temporal  {
    // Default is currently 180 Pulse
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        
        style: {
            width: defaultPulse.width,
            height: defaultPulse.height,
            fill: defaultPulse.fill,
            stroke: defaultPulse.stroke,
            strokeWidth: defaultPulse.strokeWidth
        },
        label: {
            text: defaultPulse.label.text,
            padding: defaultPulse.label.padding,
            labelPosition: positionEval[defaultPulse.label.labelPosition],
            style: {
                size: defaultPulse.label.style.size,
                colour: defaultPulse.label.style.colour
            }
        },
    }
    
    // A pulse that is an svg rect
    style: simplePulseStyle;
    lable?: Label;
    
    public static anyArgConstruct(elementType: typeof SimplePulse, args: any): SimplePulse {
        const options = args ? UpdateObj(elementType.defaults, args) : elementType.defaults;

        var el = new elementType(options.timestamp,
                                 options.orientation,
                                 options.padding,
                                 options.style,
                                 options.label)

        return el;
    }

    constructor(timestamp: number, 
                orientation: Orientation, 
                padding: number[], 
                style: simplePulseStyle,
                label: labelInterface,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              orientation,
              padding, 
              offset,
              label,
              {width: style.width, height: style.height});

        this.style = style;
    }

    draw(surface: SVG.Svg) {
        surface.rect(this.width, this.height)
        .attr(this.style)
        .move(this.x, this.y)
        // BAD FIX
        .attr({"stroke-width": this.style.strokeWidth});

        if (this.label) {
            this.drawLabel(surface);
        }

    }

    verticalProtrusion(channelThickness: number) : number[] {
        var dimensions = [];

        switch (this.orientation) {
            case Orientation.Top:
                var actualHeight = this.height;
                if (this.style.strokeWidth) {
                    actualHeight -= this.style.strokeWidth!/2;
                }
                
                dimensions = [actualHeight, 0];
                break;

            case Orientation.Bottom:
                var actualHeight = this.height;
                if (this.style.strokeWidth) {
                    actualHeight += this.style.strokeWidth!/2;
                }

                dimensions = [0, actualHeight];
                break;

            case Orientation.Both: // LOOK AT THIS
                var actualHeight = this.height/2 - channelThickness/2;
                if (this.style.strokeWidth) {
                    actualHeight += this.style.strokeWidth!/2;
                }

                dimensions = [actualHeight, actualHeight];
                break;
        }


        if (this.label) {
            switch (this.label.labelPosition) {
                case LabelPosition.Top:
                    dimensions[0] += this.label.height + this.label.padding[0] + this.label.padding[2];
                    break;
                case LabelPosition.Bottom:
                    dimensions[1] += this.label.height + this.label.padding[0] + this.label.padding[2];
                    break;    
            }
            
        }

        return dimensions;
    }

    positionVertically(y: number, channelThickness: number): number[] {
        var protrusion = this.verticalProtrusion(channelThickness);

        switch (this.orientation) {
            case Orientation.Top:
                this.y = y - this.height;


                if (this.style.strokeWidth) {
                    this.y += this.style.strokeWidth!/2;
                }
                break;

            case Orientation.Bottom:
                this.y = y + channelThickness;

                if (this.style.strokeWidth) {
                    this.y = this.y - this.style.strokeWidth!/2;
                }
                break;

            case Orientation.Both:
                this.y = y + channelThickness/2 - this.height/2

                if (this.style.strokeWidth) {
                    this.y = this.y;
                }
                break;
        }
    
        return protrusion;
    }

}

