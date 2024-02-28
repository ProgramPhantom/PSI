import Temporal, {Orientation, temporalInterface, labelable, temporalConfig, Alignment} from "./temporal";
import * as defaultAbstract from "./default/data/abstract.json"
import * as SVG from '@svgdotjs/svg.js'
import Label, { Position, labelInterface} from "./label";
import { UpdateObj } from "./util";

export interface abstractInterface extends temporalInterface {
    text: string,
    style: abstractStyle,
}

export interface abstractStyle {
    width: number,
    height: number,
    fill: string,
    stroke?: string | null,  // Optional
    strokeWidth?: number | null
}



export default class Abstract extends Temporal {
    // Default is currently 180 Pulse 
    
    static defaults: {[key: string]: abstractInterface} = {"abstract": {...<any>defaultAbstract }}
    
    // A pulse that is an svg rect
    style: abstractStyle;
    textLabel: Label;
    
    public static anyArgConstruct(defaultArgs: abstractInterface, args: any): Abstract {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        var el = new Abstract(options.timestamp,
                                 {config: options.config,
                                  padding: options.padding,
                                  text: options.text,
                                  style: options.style,
                                  label: options.label,
                                  arrow: options.arrow})

        return el;
    }

    constructor(timestamp: number,
                params: abstractInterface,
                offset: number[]=[0, 0]) {

        super(timestamp, 
              params,
              offset);

        this.style = params.style;
        this.textLabel = Label.anyArgConstruct(Label.defaults["label"], {text: params.text, position: Position.centre, style: {size: 60, colour: "white"}})

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

        console.log(this.textLabel.text)
        this.drawText(surface);

        if (this.label) {
            this.drawLabel(surface);
        }
    }

    drawText(surface: SVG.Svg) {
        var textX = this.x + this.width/2 - this.textLabel.width/2;
        var textY = this.y + this.height /2 - this.textLabel.height/2 + this.textLabel.padding[0];
     
        this.textLabel.move(textX, textY);
        this.textLabel.draw(surface);
    }

    

}

