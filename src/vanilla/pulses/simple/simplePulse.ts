import Temporal, {Orientation, temporalInterface, labelable, temporalConfig, Alignment} from "../../temporal";
import * as defaultPulse from "../../default/data/180pulse.json"
import * as SVG from '@svgdotjs/svg.js'
import SVGPulse from "../image/svgPulse";
import Label, { LabelPosition, labelInterface } from "../../label";
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
        config: {
            orientation: Orientation[defaultPulse.config.orientation as keyof typeof Orientation],
            alginment: Alignment[defaultPulse.config.alignment as keyof typeof Alignment],
            overridePad: defaultPulse.config.overridePad,
            inheritWidth: defaultPulse.config.inheritWidth,
        },
        
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
            labelPosition: LabelPosition[defaultPulse.label.labelPosition as keyof typeof LabelPosition],
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
                                 options.config,
                                 options.padding,
                                 options.style,
                                 options.label)

        return el;
    }

    constructor(timestamp: number, 
                config: temporalConfig, 
                padding: number[], 
                style: simplePulseStyle,
                label: labelInterface,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              config,
              padding, 
              offset,
              label,
              {width: style.width, height: style.height});

        this.style = style;
    }

    draw(surface: SVG.Svg) {
        

        surface.rect(this.width, this.height)
        .attr({fill: this.style.fill,
                stroke: this.style.stroke})
        .move(this.x, this.y)
        // BAD FIX
        .attr({"stroke-width": this.style.strokeWidth});

        if (this.label) {
            this.drawLabel(surface);
        }

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

