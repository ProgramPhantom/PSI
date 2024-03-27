import { Svg } from "@svgdotjs/svg.js";
import Arrow, { arrowInterface, arrowStyle } from "./arrow";
import { Position, labelInterface } from "./label";
import Temporal, { Alignment, Orientation, labelable, temporalInterface, temporalConfig } from "./temporal";
import * as defaultSpan from "./default/data/span.json"
import { UpdateObj } from "./util";


export interface spanInterface extends temporalInterface {
    width: number,
}   

export default class Span extends Temporal {
    static defaults: {[name: string]: spanInterface} = {"span": {...<any>defaultSpan },
                                                        "annotationSpan": {...<any>defaultSpan }}

    static anyArgConstruct(defaultArgs: temporalInterface, args: any): Span {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        var el = new Span({width: options.width,
                          config: options.config,
                          padding: options.padding,
                          offset: options.offset,
                          labelOn: options.labelOn,
                          label: options.label,
                          arrowOn: options.arrowOn,
                          arrow: options.arrow})

        return el;
    }

    constructor(params: spanInterface) {
            
        super(params)

        this.dim = {width: params.width, height: 0}

        if (this.decoration.arrow) {
            this.decoration.arrow.set(0, 0, this.width, 0)
        }

        this.decoration.computeDimensions();
    }

    public draw(surface: Svg): void {
        if (this.decoration.label || this.decoration.arrow) {
            this.positionDecoration();
            this.decoration.draw(surface);
        }
    }

    
}