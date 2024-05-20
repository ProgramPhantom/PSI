import { Svg } from "@svgdotjs/svg.js";
import Arrow, { IArrow, arrowStyle } from "./arrow";
import { Position, ILabel } from "./label";
import Positional, { Alignment, Orientation, labelable, IPositional, positionalConfig } from "./positional";
import * as defaultSpan from "./default/data/span.json"
import { FillObject, UpdateObj } from "./util";
import { IDraw } from "./element";


export interface ISpan extends IPositional {
    width: number,
}   

export default class Span extends Positional implements IDraw {
    static defaults: {[name: string]: ISpan} = {"span": {...<any>defaultSpan },
                                                "annotationSpan": {...<any>defaultSpan }}

    constructor(params: Partial<ISpan>, templateName: string="span") {
        var fullParams: ISpan = FillObject(params, Span.defaults[templateName])
        super(fullParams)

        this.dim = {width: fullParams.width, height: 0}

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