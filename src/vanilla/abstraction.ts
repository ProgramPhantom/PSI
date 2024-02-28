import Temporal, {Orientation, temporalInterface, labelable, temporalConfig, Alignment} from "./temporal";
import * as defaultAbstraction from "./default/data/abstraction.json"
import * as SVG from '@svgdotjs/svg.js'
import Label, { Position, labelInterface} from "./label";
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
    
    static defaults: {[key: string]: abstractionInterface} = {"abstraction": {...<any>defaultAbstraction }}
    
    // A pulse that is an svg rect
    style: abstractionStyle;
    
    public static anyArgConstruct(defaultArgs: abstractionInterface, args: any): Abstraction {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        var el = new Abstraction(options.timestamp,
                                 {config: options.config,
                                  padding: options.padding,
                                  style: options.style,
                                  label: options.label})

        return el;
    }

    constructor(timestamp: number,
                params: abstractionInterface,
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
        surface.rect(this.width, this.height)
        .attr(this.style)
        .move(this.x, this.y)
        // BAD FIX
        .attr({"stroke-width": this.style.strokeWidth,
               "shape-rendering": "crispEdges"});

        if (this.label) {
            this.drawLabel(surface);
        }
    }

}

