import { Element, IElement } from "./element";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import * as defaultSpanLabel from "./default/data/spanLabel.json";
import { FillObject, PartialConstruct, UpdateObj } from "./util";
import Label, { Position as Position, ILabel } from "./label";
import Arrow, { ArrowPosition, IArrow } from "./arrow";


export interface IAnnotation extends IElement {
    labelOn: boolean;
    label: ILabel;

    arrowOn: boolean;
    arrow: IArrow;
}


export default class SpanningLabel extends Element {
    static defaults: {[key: string]: IAnnotation} = {"spanlabel": {...<any>defaultSpanLabel}}


    labelOn: boolean;
    label?: Label;

    arrowOn: boolean;
    arrow?: Arrow;

    constructor(params: Partial<IAnnotation>, templateName: string="spanlabel") {
        var fullParams: IAnnotation = FillObject(params, SpanningLabel.defaults[templateName]);
        super(0, 0, fullParams.offset, fullParams.padding);

        this.labelOn = fullParams.labelOn;
        if (params.labelOn) {
            this.label = PartialConstruct(Label, fullParams.label, Label.defaults["label"])
        }
        
        this.arrowOn = fullParams.arrowOn;
        if (params.arrowOn) {
            this.arrow = PartialConstruct(Arrow, fullParams.arrow, Arrow.defaults["arrow"])
        }

        this.computeDimensions();
    }

    computeDimensions() {
        var width = 0;
        var height = 0;
        

        if (this.label) {
            height = this.label.pheight;
            width = this.label.pwidth;
          
        }
        if (this.arrow) {
            if (this.arrow.position !== ArrowPosition.inline) {
                height += this.arrow.pheight;
            }
            if (this.arrow.pheight >= height) {
                height = this.arrow.pheight;
            }

            width = this.arrow.pwidth;
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