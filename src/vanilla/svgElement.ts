import { Visual, IVisual } from "./visual";
import { svgPulses } from "./default/data/svgPulse";
import { IPositional } from "./positional";
import { FillObject, RecursivePartial } from "./util";
import { Element, Svg } from "@svgdotjs/svg.js";
import { SVG } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";

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

	elementGroup: G = new G();
	style: ISVGStyle;
    path: string;
	override svg: Element;

    constructor(params: RecursivePartial<ISVG>, templateName: string="default") {
		var fullParams: ISVG = FillObject(params, SVGElement.defaults[templateName])
		super(fullParams, templateName);

		this.style = fullParams.style;
        this.path = fullParams.path;

		try {
			var rawSVG: Element = SVG(svgContent[this.path])
		} catch {
			throw new Error(`Cannot find path ${this.path}`)
		}

		// Wrap svg contents inside a group for translation. 
		var innerSVG = rawSVG.children()
		innerSVG.forEach((c) => {
			this.elementGroup.add(c);
		})

		this.svg = SVG(rawSVG.node.outerHTML).height(this.contentHeight ?? 0).width(this.contentWidth ?? 0);
		this.svg.add(this.elementGroup);

		this.id = this.svg.id();
		this.elementGroup.id(this.id);
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
	
			this.svg.move(this.drawX, this.drawY);
			this.svg.size(this.contentWidth, this.contentHeight)

			surface.add(this.svg);
		}
        
    }

	verticalFlip() {
		// https://stackoverflow.com/questions/65514861/transform-is-not-applied-on-embedded-svgs-chrome

        // TODO: this is slightly problematic
        this.offset = [this.offset[0], -Math.abs(this.offset[1])];  // Strange entanglement error was happening here
		
		this.elementGroup.attr({"transform-origin": "center"});

        this.elementGroup.transform({a: 1, b: 0, c: 0, d: -1, e: 0, f: 0})


        this.padding = [this.padding[2], this.padding[1], this.padding[0], this.padding[3]]
    }

	public restructure(data: Partial<ISVG>): void {
		// Path
		this.path = data.path ?? this.path;
		
		// Style:
		this.style = data.style ?? this.style;

		super.restructure(data);
	}
}