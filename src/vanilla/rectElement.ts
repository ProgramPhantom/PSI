import { Svg } from "@svgdotjs/svg.js";
import { Visual, IVisual, IDraw } from "./visual";
import { FillObject, RecursivePartial } from "./util";
import PaddedBox, { IHaveDefault, IPaddedBox } from "./paddedBox";
import { simplePulses } from "./default/data/simplePulse";
import defaultBar from "./default/data/bar.json";
import { SVG } from "@svgdotjs/svg.js";
import { Rect } from "@svgdotjs/svg.js";
import { Element } from "@svgdotjs/svg.js";
import { ElementTypes } from "./point";

export interface IRectStyle {
	fill: string,
	stroke: string | null,
	strokeWidth: number | null
}

export interface IRect extends IVisual {
	style: IRectStyle,
}

export default class RectElement extends Visual implements IRect, IDraw {
	static defaults: {[key: string]: IRect } = {...<any>simplePulses,
        "bar": <any>defaultBar
    };
    getState: () => IRect = () => { return {
        x: this.x,
        y: this.y,
        contentWidth: this.contentWidth,
        contentHeight: this.contentHeight,
        padding: this.padding,
        offset: this.offset,
        style: this.style,
    }}
    static ElementType: ElementTypes = "rect"; 

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

    draw(surface: Element) {
        if (this.dirty) {
            if (this.svg) {
                try {
                    this.svg.remove();
                } catch {
                    
                }
                
            }

            this.svg = new Rect().size(this.contentWidth, this.contentHeight)
            .attr({fill: this.style.fill,
                    stroke: this.style.stroke})
            .move(this.contentX + this.offset[0], this.contentY + this.offset[1])
            .attr({"stroke-width": this.style.strokeWidth,
                   "shape-rendering": "crispEdges"
            });
            surface.add(this.svg);

            this.id = this.svg.id();
        }
    }

    public restructure(data: Partial<IRect>): void {
        // Style:
        this.style = data.style ?? this.style;

        super.restructure(data);
    }
}