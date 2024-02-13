import Temporal, {Orientation, temporalInterface, labelable, temporalPosition, Alignment} from "./temporal";
import * as defaultAbstraction from "./default/abstraction.json"
import * as SVG from '@svgdotjs/svg.js'
import Label, { LabelPosition, labelInterface} from "./label";
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
        positioning: {
            orientation: Orientation[defaultAbstraction.positioning.orientation as keyof typeof Orientation],
            alginment: Alignment[defaultAbstraction.positioning.alignment as keyof typeof Alignment],
            overridePad: defaultAbstraction.positioning.overridePad,
        },
    
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
            labelPosition: LabelPosition[defaultAbstraction.label.labelPosition as keyof typeof LabelPosition],
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
                                 options.positioning,
                                 options.padding,
                                 options.style,
                                 options.label)

        return el;
    }

    constructor(timestamp: number,
                positioning: temporalPosition, 
                padding: number[], 
                style: abstractionStyle,
                label: labelInterface,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              positioning,
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



}

