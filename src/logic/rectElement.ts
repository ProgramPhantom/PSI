import { Element, Rect, SVG } from "@svgdotjs/svg.js";
import { UserComponentType } from "./point";
import Visual, { IDraw, IVisual } from "./visual";

export interface IRectStyle {
	fill: string;
	stroke?: string;
	strokeWidth?: number;
}

export interface IRectElement extends IVisual {
	style: IRectStyle;
}

export default class RectElement extends Visual implements IRectElement, IDraw {
	get state(): IRectElement {
		return {
			style: this.style,
			...super.state
		};
	}
	static ElementType: UserComponentType = "rect";

	style: IRectStyle;

	constructor(params: IRectElement) {
		super(params);

		this.style = params.style;

		this.svg = SVG()
			.rect(this.contentWidth, this.contentHeight)
			.attr({ fill: this.style.fill, stroke: this.style.stroke })
			.attr({
				"stroke-width": this.style.strokeWidth,
				"shape-rendering": "crispEdges"
			});
	}

	draw(surface: Element) {
		
		if (this.svg) {
			try {
				this.svg.remove();
			} catch { }
		}

		this.svg = new Rect()
			.size(this.contentWidth, this.contentHeight)
			.attr({ fill: this.style.fill, stroke: this.style.stroke })
			.move(this.cx + this.offset[0], this.cy + this.offset[1])
			.attr({
				"stroke-width": this.style.strokeWidth,
				"shape-rendering": "crispEdges",
			});
		surface.add(this.svg);

		// Do we want elements to have our ID system or the SVGjs ID system?
		this.svg.id(this.id);
		

		super.draw(surface)
	}

	public static isRectElement(obj: any): obj is SVGElement {
		return (obj as RectElement).style.fill !== undefined;
	}
}
