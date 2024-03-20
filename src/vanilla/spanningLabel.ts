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

        this.computeDimensions();
    }

    computeDimensions() {
        var width = 0;
        var height = 0;
        
        if (this.arrow) {
            width = this.arrow.pwidth;

            if (this.arrow.position !== ArrowPosition.inline) {
                height = this.arrow.pheight;
            }
        }
        if (this.label) {
            height += this.label.pheight;

            if (this.label.pwidth > width) {
                width = this.label.pwidth;
            }
        }

        this.dim = {width: width, height: height}
    }

    arrange() {
        var labelX, labelY = 0;
        var level;

        if (this.label) {
            this.label.px = this.x + this.pwidth/2 - this.label.width/2;;
            this.label.py = this.y;
        }

        if (this.arrowOn && this.arrow) {
            switch (this.arrow.position) {
                case ArrowPosition.top:  // Arrow is on top of the label
                    level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    this.arrow.set(this.x, level, this.x + this.width, level);

                    if ((this.label !== undefined)) {
                        this.label.py += this.arrow.pheight;
                    }
                    break;
                case ArrowPosition.inline:  // Arrow inline
                    if (this.label) {
                        this.label.style.background = "white";
                        this.label.y = this.y;

                        level = this.label.y + this.label.height/2 ;
                    } else {
                        level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    }
                    
                    this.arrow.set(this.x, level, this.x + this.width, level);
                    break;
                case ArrowPosition.bottom:  // Arrow underneath
                    if (this.label) {
                        this.label.py = this.y;
                        console.log(this.py)
                        level = this.y + this.label.pheight + this.arrow.padding[0];
                    } else {
                        level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    }

                    this.arrow.set(this.x, level, this.x + this.width, level);
                    break;
                default:
                    throw new Error(`Unknown arrow position '${this.arrow.position}'`)
            }
        }
    }

    draw(surface: Svg) {
        this.arrange();

        if (this.arrow) {
            this.arrow.draw(surface);
        }

        if (this.label) {
            this.label.draw(surface);
        }
    }
}