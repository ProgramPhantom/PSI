import { Svg } from "@svgdotjs/svg.js";
import { Visual, IVisual } from "./visual";
import { FillObject, RecursivePartial } from "./util";
import PaddedBox, { IHaveDefault, IPaddedBox } from "./paddedBox";
import { simplePulses } from "./default/data/simplePulse";
import defaultBar from "./default/data/bar.json";
import Positional, { IPositional } from "./positional";
import { SVG } from "@svgdotjs/svg.js";

export interface IRectStyle {
	fill: string,
	stroke: string | null,
	strokeWidth: number | null
}

export interface IRect extends IVisual {
	style: IRectStyle,
}

export type PositionalRect = IRect & IPositional
export default class RectElement extends Visual implements IRect {
	static defaults: {[key: string]: PositionalRect } = {...<any>simplePulses,
        "bar": <any>defaultBar
    };

	style: IRectStyle;	

    constructor(params: RecursivePartial<IRect>, templateName: string="pulse90") {
		var fullParams: IRect = FillObject(params, RectElement.defaults[templateName])
		super(fullParams, templateName);

		this.style = fullParams.style;

        this.svg = SVG().rect(this.contentWidth, this.contentHeight)
        .attr({fill: this.style.fill,
                stroke: this.style.stroke})
        .attr({"stroke-width": this.style.strokeWidth,
               "shape-rendering": "crispEdges"
        })
	}

    draw(surface: Svg) {
        if (this.dirty) {
            if (this.svg) {
                try {
                    surface.removeElement(this.svg);
                } catch {
                    
                }
                
            }

            this.svg = surface.rect(this.contentWidth, this.contentHeight)
            .attr({fill: this.style.fill,
                    stroke: this.style.stroke})
            .move(this.contentX + this.offset[0], this.contentY + this.offset[1])
            .attr({"stroke-width": this.style.strokeWidth,
                   "shape-rendering": "crispEdges"
            });

            this.id = this.svg.id();
        }
    }

    public restructure(data: Partial<IRect>): void {
        // Style:
        this.style = data.style ?? this.style;

        super.restructure(data);
    }
}