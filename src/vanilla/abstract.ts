import Temporal, {Orientation, temporalInterface, labelable, temporalConfig, Alignment} from "./temporal";
import * as defaultAbstract from "./default/data/abstract.json"
import * as SVG from '@svgdotjs/svg.js'
import Label, { Position, labelInterface} from "./label";
import { UpdateObj } from "./util";
import { simplePulseStyle } from "./pulses/simple/simplePulse";

export interface abstractInterface extends temporalInterface {
    text: string,
    style: simplePulseStyle,
}



export default class Abstract extends Temporal {
    // Default is currently 180 Pulse 
    
    static defaults: {[key: string]: abstractInterface} = {"abstract": {...<any>defaultAbstract }}
    
    // A pulse that is an svg rect
    style: simplePulseStyle;
    textLabel: Label;
    
    public static anyArgConstruct(defaultArgs: abstractInterface, args: any): Abstract {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;
        
        var absInt: abstractInterface = {config: options.config,
                                         padding: options.padding,
                                         text: options.text,
                                         style: options.style,
                                         labelOn: options.labelOn,
                                         label: options.label,
                                         arrowOn: options.arrowOn,
                                         arrow: options.arrow};

        var el = new Abstract(options.timestamp, absInt)

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

        if (this.arrow || this.label) {
            this.posDrawDecoration(surface)
        }
    }

    drawText(surface: SVG.Svg) {
        var textX = this.x + this.width/2 - this.textLabel.width/2;
        var textY = this.y + this.height /2 - this.textLabel.height/2 + this.textLabel.padding[0];
     
        this.textLabel.move(textX, textY);
        this.textLabel.draw(surface);
    }

    

}

