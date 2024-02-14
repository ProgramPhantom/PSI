import Temporal, {Orientation, temporalInterface, labelable, temporalConfig, Alignment} from "./temporal";
import * as defaultAbstraction from "./default/data/abstraction.json"
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
    
    static defaults: abstractionInterface = {...<any>defaultAbstraction}
    
    // A pulse that is an svg rect
    style: abstractionStyle;
    lable?: Label;

    
    public static anyArgConstruct(elementType: typeof Abstraction, args: any): Abstraction {
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
                style: abstractionStyle,
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
        .attr(this.style)
        .move(this.x, this.y)
        // BAD FIX
        .attr({"stroke-width": this.style.strokeWidth});

        if (this.label) {
            this.drawLabel(surface);
        }
    }



}

