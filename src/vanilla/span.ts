import { Svg } from "@svgdotjs/svg.js";
import Arrow, { arrowStyle } from "./arrow";
import { LabelPosition, labelInterface } from "./label";
import Temporal, { Alignment, Orientation, labelable, temporalInterface, temporalConfig } from "./temporal";
import * as defaultSpan from "./default/data/span.json"
import { UpdateObj } from "./util";


interface spanInterface extends temporalInterface {

    width: number,
    style: arrowStyle
}   

export default class Span extends Temporal implements labelable {
    static defaults: {[name: string]: spanInterface} = {"span": {...<any>defaultSpan }}

    static anyArgConstruct(defaultArgs: temporalInterface, args: any): Span {

        const spanOptions = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        var el = new Span(spanOptions.timestamp,
                                 {config: spanOptions.config,
                                  padding: spanOptions.padding,
                                  style: spanOptions.style,
                                  width: spanOptions.width,
                                  label: spanOptions.label},
                                  spanOptions.offset
                                 )

        return el;
    }

    arrow?: Arrow;
    arrowStyle: arrowStyle;

    constructor(timestamp: number=0,
                params: spanInterface,
                offset: number[]=[0,0]) {
            
        super(timestamp, params, offset)

        this.bounds = {width: params.width, height: params.style.thickness + params.padding[2]}
        this.actualBounds = {width: params.padding[3] + params.width + params.padding[1], height: params.padding[0] + params.style.thickness + params.padding[2]}
                    
        this.arrowStyle = params.style;
    }

    public draw(surface: Svg): void {
        this.arrow = new Arrow(this.x, this.y, this.x + this.width, this.y, this.arrowStyle)
        
        this.arrow.draw(surface);

        if (this.label) {
            this.drawLabel(surface);
        }
    }

    
}