import Positional, {Orientation, IPositional, labelable, positionalConfig, Alignment} from "./positional";
import * as defaultAbstract from "./default/data/abstract.json"
import * as SVG from '@svgdotjs/svg.js'
import Label, { Position, ILabel} from "./label";
import { FillObject, PartialConstruct, UpdateObj } from "./util";
import { simplePulseStyle } from "./pulses/simple/simplePulse";
import { IDraw } from "./element";
import { Section } from "@blueprintjs/core";

export interface IAbstract extends IPositional {
    text: string,
    style: simplePulseStyle,
}



export default class Abstract extends Positional implements IDraw {
    // Default is currently 180 Pulse 
    
    static defaults: {[key: string]: IAbstract} = {"abstract": {...<any>defaultAbstract }}
    
    // A pulse that is an svg rect
    style: simplePulseStyle;
    textLabel: Label;

    constructor(params: Partial<IAbstract>, templateName: string="abstract") {
        var fullParams: IAbstract = FillObject(params, Abstract.defaults[templateName])
        super(fullParams);

        this.style = fullParams.style;
        this.textLabel = PartialConstruct(Label, {text: fullParams.text, position: Position.centre, style: {size: 60, colour: "white"}}, Label.defaults["label"]) 

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

