import { Svg } from "@svgdotjs/svg.js";
import { Visual, IVisual, IDraw } from "./visual";
import { FillObject, RecursivePartial, createWithTemplate } from "./util";
import { simplePulses } from "./default/data/simplePulse";
import defaultBar from "./default/data/bar.json";
import { SVG } from "@svgdotjs/svg.js";
import { Rect } from "@svgdotjs/svg.js";
import { Element } from "@svgdotjs/svg.js";
import RectElementForm from "../form/RectForm";
import { UserComponentType } from "./diagramHandler";

export interface IRectStyle {
	fill: string,
	stroke: string | null,
	strokeWidth: number | null
}

export interface IRectElement extends IVisual {
	style: IRectStyle,
}

export default class RectElement extends Visual implements IRectElement, IDraw {
	static namedElements: {[key: string]: IRectElement } = {
        "bar": {
            "ref": "bar",
            "contentWidth": 10,
            "contentHeight": 10,
            "padding": [0, 0, 0, 0],
            "offset": [0, 0],
            "style": {
                "fill": "#000000",
                "stroke": "black",
                "strokeWidth": null
            }
        }
    };
    get state(): IRectElement { return {
        style: this.style,
        ...super.state
    }}
    static ElementType: UserComponentType = "rect";
    static form: React.FC = RectElementForm;

	style: IRectStyle;	

    constructor(params: IRectElement);
    constructor(params: RecursivePartial<IRectElement>, templateName: string);
    constructor(params: RecursivePartial<IRectElement> | IRectElement, templateName?: string) {
		const fullParams = createWithTemplate<IRectElement>(RectElement.namedElements)(params, templateName);
		super(fullParams);

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

    public restructure(data: Partial<IRectElement>): void {
        // Style:
        this.style = data.style ?? this.style;

        super.restructure(data);
    }
}