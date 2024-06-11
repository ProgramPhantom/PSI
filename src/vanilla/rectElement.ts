import { Svg } from "@svgdotjs/svg.js";
import { Visual, IElement } from "./visual";
import { FillObject, RecursivePartial } from "./util";
import PaddedBox, { IHaveDefault, IPaddedBox } from "./paddedBox";
import { simplePulses } from "./default/data/simplePulse";
import defaultBar from "./default/data/bar.json";
import Positional, { IPositional } from "./positional";

interface IRectStyle {
	fill: string,
	stroke?: string,
	strokeWidth?: number
}

export interface IRect extends IElement {
	style: IRectStyle,
    width: number,
    height: number
}

export type PositionalRect = IRect & IPositional
export default class RectElement extends Visual {
	static defaults: {[key: string]: PositionalRect } = {...<any>simplePulses,
        "bar": <any>defaultBar
    };

	style: IRectStyle;	

    constructor(params: RecursivePartial<IRect>, templateName: string="pulse90") {
		var fullParams: IRect = FillObject(params, RectElement.defaults[templateName])
		super(fullParams, templateName);

		this.style = fullParams.style;

		// this.svgContent = this.getSVG();
	}

    surface?: Svg;

    draw(surface: Svg) {
		// surface.clear();
        if (this.surface === surface) {
            console.log("the same")
        } else {
            console.log("not the same")
            this.surface = surface;
        }

        console.log(surface.children());
        console.log(this.svg?.parent());

        if (this.dirty) {
            console.log(surface.children().length)
            if (this.svg) {
                surface.removeElement(this.svg);
            }
            
            console.log(surface.children().length)
            console.log(this.svg?.parent());

            this.svg = surface.rect(this.contentWidth, this.contentHeight)
            .attr({fill: this.style.fill,
                    stroke: this.style.stroke})
            .move(this.contentX + this.offset[0], this.contentY + this.offset[1])
            .attr({"stroke-width": this.style.strokeWidth,
                   "shape-rendering": "crispEdges"
            });

            this.svg.parent()
            console.log("svg parent set to: ", this.svg.parent())
            if (this.svg.parent() === surface) {
                console.log("parent set correctly")
            }
        }
    
    }
}