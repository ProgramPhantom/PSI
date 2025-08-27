import { Svg } from "@svgdotjs/svg.js";
import { Visual, IVisual, IDraw } from "./visual";
import { FillObject, RecursivePartial } from "./util";
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
	static defaults: {[key: string]: IRectElement } = {...<any>simplePulses,
        "bar": <any>defaultBar
    };
    get state(): IRectElement { return {
        style: this.style,
        ...super.state
    }}
    static ElementType: UserComponentType = "rect";
    static form: React.FC = RectElementForm;

	style: IRectStyle;	

    constructor(params: RecursivePartial<IRectElement>, templateName: string="90-pulse") {
		var fullParams: IRectElement = FillObject<IRectElement>(params, RectElement.defaults[templateName])
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