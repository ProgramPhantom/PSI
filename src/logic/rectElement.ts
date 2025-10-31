import { Element, Rect, SVG } from "@svgdotjs/svg.js";
import { UserComponentType } from "./point";
import Visual, { IDraw, IVisual } from "./visual";

console.log("Load module rect element")

export interface IRectStyle {
	fill: string;
	stroke: string | null;
	strokeWidth: number | null;
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
			.attr({fill: this.style.fill, stroke: this.style.stroke})
			.attr({
				"stroke-width": this.style.strokeWidth,
				"shape-rendering": "crispEdges"
			});
	}

	draw(surface: Element) {
		if (this.dirty) {
			if (this.svg) {
				try {
					this.svg.remove();
				} catch {}
			}

			this.svg = new Rect()
				.size(this.contentWidth, this.contentHeight)
				.attr({fill: this.style.fill, stroke: this.style.stroke})
				.move(this.contentX + this.offset[0], this.contentY + this.offset[1])
				.attr({
					"stroke-width": this.style.strokeWidth,
					"shape-rendering": "crispEdges",
				});
			surface.add(this.svg);

			this.id = this.svg.id();
		}
	}

	public static isRectElement(obj: any): obj is SVGElement {
		return (obj as RectElement).style.fill !== undefined;
	}
}
