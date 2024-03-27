import { Svg } from "@svgdotjs/svg.js";
import Arrow, { arrowInterface, arrowStyle } from "./arrow";
import { Position, labelInterface } from "./label";
import Temporal, { Alignment, Orientation, labelable, temporalInterface, temporalConfig } from "./temporal";
import * as defaultSpan from "./default/data/span.json"
import { UpdateObj } from "./util";
import { IDraw } from "./drawable";


export interface spanInterface extends temporalInterface {
    width: number,
}   

export default class Span extends Temporal implements IDraw {
    static defaults: {[name: string]: spanInterface} = {"span": {...<any>defaultSpan },
                                                        "annotationSpan": {...<any>defaultSpan }}

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