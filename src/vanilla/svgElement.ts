import { Element, IElement } from "./element";
import { svgPulses } from "./default/data/svgPulse";
import { IPositional } from "./positional";
import { FillObject, RecursivePartial } from "./util";
import { Svg } from "@svgdotjs/svg.js";
import { SVG } from "@svgdotjs/svg.js";

const svgContent: {[path: string]: string} = {}
const svgPaths = ["\\src\\assets\\aquire2.svg",
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

export interface ISVG extends IElement {
    path: string,
    style: ISVGStyle
}


type PositionalSVG = ISVG & IPositional;
export default class SVGElement extends Element {
    static defaults: {[key: string]: PositionalSVG} = {...<any>svgPulses};

	style: ISVGStyle;
    path: string;
    svgContent: string;

    constructor(params: RecursivePartial<ISVG>, templateName: string="default") {
		var fullParams: ISVG = FillObject(params, SVGElement.defaults[templateName])
		super(fullParams);

		this.style = fullParams.style;
        this.path = fullParams.path;

        this.svgContent = this.getSVG();
	}

    resolveDimensions(): {width: number, height: number} {
        return {width: this.contentWidth, height: this.contentHeight}
    }

    draw(surface: Svg) {
        var obj = SVG(this.svgContent);
		obj.move(0, 0);
		obj.attr({"preserveAspectRatio": "none"})
		
		obj.children().forEach((c) => {
			c.attr({"vector-effect": "non-scaling-stroke"})
		})

		obj.move(this.x + this.offset[0], this.y + this.offset[1]);
		obj.size(this.contentWidth, this.contentHeight);
		surface.add(obj);
    }

    getSVG(): string {
		return svgContent[this.path]
	}
}