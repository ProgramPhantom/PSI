import { Visual, IElement } from "./visual";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import defaultAnnotation from "./default/data/annotation.json";
import { FillObject, PartialConstruct, RecursivePartial, UpdateObj } from "./util";
import Label, { Position as Position, ILabel } from "./label";
import Arrow, { ArrowPosition, IArrow } from "./arrow";
import PaddedBox from "./paddedBox";


export interface IAnnotation {
    labelOn: boolean;
    label: ILabel;

    arrowOn: boolean;
    arrow: IArrow;
}


// A combination of a label and an arrow with logic to position
export default class Annotation extends PaddedBox {
    static defaults: {[key: string]: IAnnotation} = {"default": {...<any>defaultAnnotation}}

    labelOn: boolean;
    label?: Label;

    arrowOn: boolean;
    arrow?: Arrow;

    constructor(params: RecursivePartial<IAnnotation>, templateName: string="default") {
        var fullParams: IAnnotation = FillObject(params, Annotation.defaults[templateName]);
        super(fullParams.offset, fullParams.padding);

        this.labelOn = fullParams.labelOn;
        if (params.labelOn) {
            this.label = PartialConstruct(Label, fullParams.label, Label.defaults["label"])
        }
        
        this.arrowOn = fullParams.arrowOn;
        if (params.arrowOn) {
            this.arrow = PartialConstruct(Arrow, fullParams.arrow, Arrow.defaults["arrow"])
        }

        this.resolveDimensions();
    }

    resolveDimensions(): {width: number, height: number} {
        var width = 0;
        var height = 0;
        

        if (this.label) {
            height = this.label.height;
            width = this.label.width;
        }
        if (this.arrow) {
            if (this.arrow.position !== ArrowPosition.inline) {
                height += this.arrow.height;
            } else if (this.arrow.height >= height) {  // Inline
                height = this.arrow.height;
            }

            width = this.arrow.width;
        }

        return {width: width, height: height}
    }

    arrange() {
        var labelX, labelY = 0;
        var level;

        if (this.label) {
            this.label.place({x: this.x + this.width/2 - this.label.contentWidth/2, y: this.y})
        }

        if (this.arrowOn && this.arrow) {
            switch (this.arrow.position) {
                case ArrowPosition.top:  // Arrow is on top of the label
                    level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    this.arrow.set(this.x, level, this.x + this.contentWidth, level);

                    if ((this.label !== undefined)) {
                        this.label.move({dy: this.arrow.height})
                    }
                    break;
                case ArrowPosition.inline:  // Arrow inline
                    if (this.label) {
                        this.label.style.background = "white";
                        this.label.place({y: this.y})

                        level = this.label.y + this.label.contentHeight/2 ;
                    } else {
                        level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    }
                    
                    this.arrow.set(this.x, level, this.x + this.contentWidth, level);
                    break;
                case ArrowPosition.bottom:  // Arrow underneath
                    if (this.label) {
                        this.label.y = this.y;
                        
                        level = this.y + this.label.height + this.arrow.padding[0];
                    } else {
                        level = this.y - this.arrow.padding[2] - this.arrow.style.thickness;
                    }

                    this.arrow.set(this.x, level, this.x + this.contentWidth, level);
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