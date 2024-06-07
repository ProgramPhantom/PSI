import { Svg } from "@svgdotjs/svg.js";
import { Element, IElement } from "./element";
import { FillObject } from "./util";
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
export default class RectElement extends Element {
	static defaults: {[key: string]: PositionalRect } = {...<any>simplePulses,
        "bar": <any>defaultBar
    };

	style: IRectStyle;	

    constructor(params: Partial<IRect>, templateName: string="pulse90") {
		var fullParams: IRect = FillObject(params, RectElement.defaults[templateName])
		super(fullParams, templateName);

		this.style = fullParams.style;

		// this.svgContent = this.getSVG();
	}

    draw(surface: Svg) {
		var rect = surface.rect(this.contentWidth, this.contentHeight)
        .attr({fill: this.style.fill,
                stroke: this.style.stroke})
        .move(this.contentX + this.offset[0], this.contentY + this.offset[1])
        .attr({"stroke-width": this.style.strokeWidth,
               "shape-rendering": "crispEdges"
        });
    }
}