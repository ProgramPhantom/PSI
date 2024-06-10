import Positional, {Orientation, IPositional, labelable, Alignment} from "./positional";
import defaultAbstract from "./default/data/abstract.json"
import * as SVG from '@svgdotjs/svg.js'
import Label, { Position, ILabel} from "./label";
import { FillObject, PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import { simplePulseStyle } from "./pulses/simple/simplePulse";
import { Section } from "@blueprintjs/core";

export interface IAbstract extends IPositional {
    text: string,
    style: simplePulseStyle,
}



export default class Abstract extends Positional {
    // Default is currently 180 Pulse 
    
    static defaults: {[key: string]: IAbstract} = {"abstract": {...<any>defaultAbstract }}
    
    // A pulse that is an svg rect
    style: simplePulseStyle;
    textLabel: Label;

    constructor(params: RecursivePartial<IAbstract>, templateName: string="abstract") {
        var fullParams: IAbstract = FillObject(params, Abstract.defaults[templateName])
        super(fullParams);

        this.style = fullParams.style;
        this.textLabel = PartialConstruct(Label, {text: fullParams.text, position: Position.centre, style: {size: 60, colour: "white"}}, Label.defaults["label"]) 
    }

    resolveDimensions(): {width: number, height: number} {
        return {width: this.style.width, height: this.style.height};
    }

    draw(surface: SVG.Svg) {
        surface.rect(this.contentWidth, this.contentHeight)
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
        var textX = this.x + this.contentWidth / 2 - this.textLabel.contentWidth/2;
        var textY = this.y + this.contentHeight / 2 - this.textLabel.contentHeight/2 + this.textLabel.padding[0];
     
        this.textLabel.move({dx: textX, dy: textY});
        this.textLabel.draw(surface);
    }

    

}

