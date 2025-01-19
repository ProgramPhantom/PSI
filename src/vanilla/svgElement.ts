import { Visual, IVisual } from "./visual";
import { svgPulses } from "./default/data/svgPulse";
import { IPositional } from "./positional";
import { FillObject, RecursivePartial } from "./util";
import { Element, Svg } from "@svgdotjs/svg.js";
import { SVG } from "@svgdotjs/svg.js";

const svgContent: {[path: string]: string} = {}
const svgPaths = ["\\src\\assets\\acquire2.svg",
				  "\\src\\assets\\saltirelohi.svg",
				  "\\src\\assets\\saltirehilo.svg",
				  "\\src\\assets\\halfsine.svg",
				  "\\src\\assets\\chirplohi.svg",
				  "\\src\\assets\\chirphilo.svg",
				  "\\src\\assets\\ampseries.svg",
				  "\\src\\assets\\180.svg",
				  "\\src\\assets\\trapezium.svg",
				  "\\src\\assets\\talltrapezium.svg"]

for (const p of svgPaths) {
	var svg = await fetch(p).then(
		(response) => response.text()
	).then(
		(response) => {return response}
	)

	svgContent[p] = svg;
}


interface ISVGStyle {

}


export interface ISVG extends IVisual {
    path: string,
    style: ISVGStyle
}


export type PositionalSVG = ISVG & IPositional;
export default class SVGElement extends Visual implements ISVG {
    static defaults: {[key: string]: PositionalSVG} = {...<any>svgPulses, "default": svgPulses[180]};

	style: ISVGStyle;
    path: string;
	override svg: Element;

    constructor(params: RecursivePartial<ISVG>, templateName: string="default") {
		var fullParams: ISVG = FillObject(params, SVGElement.defaults[templateName])
		super(fullParams, templateName);

		this.style = fullParams.style;
        this.path = fullParams.path;

		try {
			this.svg = SVG(svgContent[this.path]).height(this.contentHeight!).width(this.contentWidth!);
			this.id = this.svg.id();
		} catch {
			throw new Error(`Cannot find path ${this.path}`)
		}
        
		
	}

    draw(surface: Svg) {
		if (this.dirty) {
			if (this.svg) {
				this.svg.remove();
			}

			this.svg.attr({"preserveAspectRatio": "none"})
			this.svg.children().forEach((c) => {
				c.attr({"vector-effect": "non-scaling-stroke"})
			})
	
			this.svg.move(this.contentX + this.offset[0], this.contentY + this.offset[1]);
			this.svg.size(this.contentWidth, this.contentHeight).fill("#fff");

			this.id = this.svg.id();

			var clickArea = SVG().rect().width("100%").height("100%").attr({
				"fill-opacity": "0",
				"pointerEvents": "all",
				"stroke-width": "0"
			}).id(this.id);
			this.svg.add(clickArea);

			surface.add(this.svg);

			
		}
        
    }
}