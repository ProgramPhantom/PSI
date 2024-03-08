import { Svg } from "@svgdotjs/svg.js";
import Arrow, { arrowInterface, arrowStyle } from "./arrow";
import { Position, labelInterface } from "./label";
import Temporal, { Alignment, Orientation, labelable, temporalInterface, temporalConfig } from "./temporal";
import * as defaultSpan from "./default/data/span.json"
import { UpdateObj } from "./util";


interface spanInterface extends temporalInterface {
    width: number,
    arrow: arrowInterface
}   

export default class Span extends Temporal implements labelable {
    static defaults: {[name: string]: spanInterface} = {"span": {...<any>defaultSpan }}

    static anyArgConstruct(defaultArgs: temporalInterface, args: any): Span {

        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        var el = new Span(options.timestamp,
                         {width: options.width,
                          config: options.config,
                          padding: options.padding,
                          labelOn: options.labelOn,
                          label: options.label,
                          arrowOn: options.arrowOn,
                          arrow: options.arrow,},
                          options.offset)

        return el;
    }

    arrow: Arrow;

    constructor(timestamp: number,
                params: spanInterface,
                offset: number[]=[0,0]) {
            
        super(timestamp, params, offset)

        this.arrow = Arrow.anyArgConstruct(Arrow.defaults["arrow"], params.arrow);

        this.bounds = {width: params.width, height: params.arrow.style.thickness + params.padding[2]}
        this.actualBounds = {width: params.padding[3] + params.width + params.padding[1], height: params.padding[0] + params.arrow.style.thickness + params.padding[2]}

    }

    public draw(surface: Svg): void {
        if (this.label) {
            this.posDrawDecoration(surface);
        }
        
    }

    
}