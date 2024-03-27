import Temporal, {Orientation, temporalInterface, labelable, temporalConfig, Alignment} from "./temporal";
import * as defaultAbstract from "./default/data/abstract.json"
import * as SVG from '@svgdotjs/svg.js'
import Label, { Position, labelInterface} from "./label";
import { PartialConstruct, UpdateObj } from "./util";
import { simplePulseStyle } from "./pulses/simple/simplePulse";
import { IDraw } from "./drawable";

export interface abstractInterface extends temporalInterface {
    text: string,
    style: simplePulseStyle,
}



export default class Abstract extends Temporal implements IDraw {
    // Default is currently 180 Pulse 
    
    static defaults: {[key: string]: abstractInterface} = {"abstract": {...<any>defaultAbstract }}
    
    // A pulse that is an svg rect
    style: simplePulseStyle;
    textLabel: Label;

    constructor(params: abstractInterface) {

        super(params);

        this.style = params.style;
        this.textLabel = PartialConstruct(Label, {text: params.text, position: Position.centre, style: {size: 60, colour: "white"}}, Label.defaults["label"]) 

        this.dim = {width: this.style.width, height: this.style.height};
    }

    draw(surface: SVG.Svg) {
        surface.rect(this.width, this.height)
        .attr({fill: this.style.fill,
               stroke: this.style.stroke})
        .move(this.x, this.y)
        .attr({"stroke-width": this.style.strokeWidth,
               "shape-rendering": "crispEdges"});

        
        this.drawText(surface);

        if (this.decoration.arrow || this.decoration.label) {
            this.positionDecoration()
            this.decoration.draw(surface);
        }
    }

    drawText(surface: SVG.Svg) {
        var textX = this.x + this.width/2 - this.textLabel.width/2;
        var textY = this.y + this.height /2 - this.textLabel.height/2 + this.textLabel.padding[0];
     
        this.textLabel.move(textX, textY);
        this.textLabel.draw(surface);
    }

    

}

