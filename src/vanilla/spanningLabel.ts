import { Drawable } from "./drawable";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import * as defaultSpanLabel from "./default/data/spanLabel.json";
import { UpdateObj } from "./util";
import Label, { Position as Position, labelInterface } from "./label";
import Arrow, { ArrowPosition, arrowInterface } from "./arrow";


export interface spanningLabelInterface{
    labelOn: boolean;
    label: labelInterface;

    arrowOn: boolean;
    arrow: arrowInterface;
}


export default class SpanningLabel extends Drawable {
    static defaults: {[key: string]: spanningLabelInterface} = {"spanlabel": {...<any>defaultSpanLabel}}

    public static anyArgConstruct(defaultArgs: spanningLabelInterface, args: spanningLabelInterface): SpanningLabel {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        return new SpanningLabel(
            {labelOn: options.labelOn,
             label: options.label,
             arrowOn: options.arrowOn,
             arrow: options.arrow}
        )
    }

    labelOn: boolean;
    label?: Label;

    arrowOn: boolean;
    arrow?: Arrow;

    constructor(params: spanningLabelInterface,
                offset: number[]=[0, 0]) {

        super(0, 0, offset);

        this.labelOn = params.labelOn;
        if (params.labelOn) {
            this.label = Label.anyArgConstruct(Label.defaults["label"], params.label)
        }
        
        this.arrowOn = params.arrowOn;
        if (params.arrowOn) {
            this.arrow = Arrow.anyArgConstruct(Arrow.defaults["arrow"], params.arrow);
        }
    }

    draw(surface: Svg) {
        var width = 0;
        var height = 0;
        var labelX, labelY = 0;
        var level;
        
        if (this.label) {
            switch (this.label.position) {
                case Position.top:
                    labelX = this.x + this.width/2 - this.label.width/2;
                    labelY = this.y - this.label.height - this.label.padding[2];
                    break;
                case Position.bottom:
                    labelX = this.x + this.width/2 - this.label.width/2;
                    labelY = this.y + this.height + this.label.padding[0];
                    break;

                case Position.centre:
                    labelX = this.x + this.width/2 - this.label.width/2;
                    labelY = this.y + this.height /2 - this.label.height/2 + this.label.padding[0];

                    break;
                default:
                    labelX = 0;
                    labelY = 0;
            }

            width += this.label.width
            height += this.label.height;
        }

        if (this.arrow) {
            switch (this.arrow.position) {
                case ArrowPosition.top:
                    level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    this.arrow.set(this.x, level, this.x + this.width, level);
                    height += this.arrow.pheight;

                    if ((this.label !== undefined) && this.label.position === Position.top) {
                        labelY -= this.arrow.pheight;
                    }
                    break;
                case ArrowPosition.inline:
                    if (this.label) {
                        this.label.style.background = "white";
                        level = labelY + this.label.height/2;
                    } else {
                        level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    }
                    
                    this.arrow.set(this.x, level, this.x + this.width, level);
                    break;
                case ArrowPosition.bottom:
                    level = this.y + this.height + this.arrow.padding[0] + this.arrow.style.thickness;
                    this.arrow.set(this.x, level, this.x + this.width, level);

                    if ((this.label !== undefined) && this.label.position === Position.bottom) {
                        labelY += this.arrow.pheight;
                    }

                    break;
                default:
                    throw new Error(`Unknown arrow position '${this.arrow.position}'`)
            }

            this.arrow.draw(surface);
        }

        if (this.label) {
            this.label.move(labelX, labelY);
            this.label.draw(surface);
        }
    }
}