import { Svg } from "@svgdotjs/svg.js";
import Arrow, { IArrow, arrowStyle } from "./arrow";
import { Position, IText } from "./label";
import Positional, { Alignment, Orientation, labelable, IPositional, positionalConfig } from "./positional";
import defaultSpan from "./default/data/span.json"
import { FillObject, RecursivePartial, UpdateObj } from "./util";


export interface ISpan extends IPositional {
    width: number,
}   

export default class Span extends Positional {
    static defaults: {[name: string]: ISpan} = {"span": {...<any>defaultSpan },
                                                "annotationSpan": {...<any>defaultSpan }}

    constructor(params: RecursivePartial<ISpan>, templateName: string="span") {
        var fullParams: ISpan = FillObject(params, Span.defaults[templateName])
        super(fullParams)

        if (this.decoration.arrow) {
            this.decoration.arrow.set(0, 0, this.contentWidth, 0)
        }

        this.resolveDimensions();
    }

    resolveDimensions(): {width: number, height: number} {
        var dim = this.decoration.resolveDimensions();

        return dim;
    }

    public draw(surface: Svg): void {
        if (this.decoration.label || this.decoration.arrow) {
            this.positionDecoration();
            this.decoration.draw(surface);
        }
    }
}