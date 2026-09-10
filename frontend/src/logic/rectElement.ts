import { Element, Rect, SVG } from "@svgdotjs/svg.js";
import { UserComponentType } from "./point";
import Visual, { IDraw, IVisual } from "./visual";

export interface IRectStyle {
	fill?: string;
	fillOpacity?: number;
	stroke?: string;
	strokeWidth?: number;
	dashing?: [number, number];
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

		const dashingAttr = this.style.dashing && this.style.dashing[0] > 0
			? { "stroke-dasharray": `${this.style.dashing[0]} ${this.style.dashing[1]}` }
			: {};

		const fillOpacityAttr = typeof this.style.fillOpacity === "number"
			? { "fill-opacity": Math.max(0, Math.min(100, this.style.fillOpacity)) / 100 }
			: {};

		this.svg = SVG()
			.rect(this.contentWidth, this.contentHeight)
			.attr({ fill: this.style.fill ?? "none", stroke: this.style.stroke, ...fillOpacityAttr })
			.attr({
				"stroke-width": this.style.strokeWidth,
				"shape-rendering": "crispEdges",
				...dashingAttr
			});
	}

	draw(surface: Element) {

		if (this.svg) {
			try {
				this.svg.remove();
			} catch { }
		}

		const dashingAttr = this.style.dashing && this.style.dashing[0] > 0
			? { "stroke-dasharray": `${this.style.dashing[0]} ${this.style.dashing[1]}` }
			: {};

		const fillOpacityAttr = typeof this.style.fillOpacity === "number"
			? { "fill-opacity": Math.max(0, Math.min(100, this.style.fillOpacity)) / 100 }
			: {};

		this.svg = new Rect()
			.size(this.contentWidth, this.contentHeight)
			.attr({ fill: this.style.fill ?? "none", stroke: this.style.stroke, ...fillOpacityAttr })
			.move(this.drawCX, this.drawCY)
			.attr({
				"stroke-width": this.style.strokeWidth,
				"shape-rendering": "crispEdges",
				...dashingAttr
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
