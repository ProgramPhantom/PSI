import Temporal, {Orientation, orientationEval, temporalInterface, labelable} from "./temporal";
import * as defaultAbstraction from "./default/abstraction.json"
import * as SVG from '@svgdotjs/svg.js'
import Label, { LabelPosition, labelInterface, positionEval } from "./label";
import { UpdateObj } from "./util";


export interface abstractionInterface extends temporalInterface {
    style: abstractionStyle,
}

export interface abstractionStyle {
    width: number,
    height: number,
    fill: string,
    stroke?: string | null,  // Optional
    strokeWidth?: number | null
}



export default class Abstraction extends Temporal {
    // Default is currently 180 Pulse 
    
    static defaults: abstractionInterface = {
        padding: defaultAbstraction.padding,
        orientation: orientationEval[defaultAbstraction.orientation],
    
        style: {
            width: defaultAbstraction.style.width,
            height: defaultAbstraction.style.height,
            fill: defaultAbstraction.style.fill,
            stroke: defaultAbstraction.style.stroke,
            strokeWidth: defaultAbstraction.style.strokeWidth
        },
        label: {
            text: defaultAbstraction.label.text,
            padding: defaultAbstraction.label.padding,
            labelPosition: positionEval[defaultAbstraction.label.labelPosition],
            style: {
                size: defaultAbstraction.label.style.size,
                colour: defaultAbstraction.label.style.colour
            }
        },
    } 
    
   
   
    
    // A pulse that is an svg rect
    style: abstractionStyle;
    lable?: Label;

    
    public static anyArgConstruct(elementType: typeof Abstraction, args: any): Abstraction {
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
                style: abstractionStyle,
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

