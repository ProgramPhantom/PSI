import { Visual, IVisual, IDraw } from "./visual";
import { svgPulses } from "./default/data/svgPulse";
import { FillObject, RecursivePartial } from "./util";
import { Element, Svg } from "@svgdotjs/svg.js";
import { SVG } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";
import { Orientation } from "./mountable";
import Labellable, { ILabellable } from "./labellable";
import { ElementTypes } from "./point";
import SVGElementForm from "../form/SVGElementForm";

// ----------- TEMPORARY ---------------
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
// ---------------------------------------


interface ISVGStyle {

}

export interface ISVG extends IVisual {
    path: string,
    style: ISVGStyle
}


export default class SVGElement extends Visual implements ISVG, IDraw {
    static override defaults: {[key: string]: ISVG} = {...<any>svgPulses, "default": svgPulses[180]};
	get state(): ISVG { return {
        x: this.x,
        y: this.y,
        contentWidth: this.contentWidth,
        contentHeight: this.contentHeight,
        padding: this.padding,
        offset: this.offset,
		path: this.path,
		style: this.style,
		mountConfig: this.mountConfig,
		ref: this.ref
    }}
	static ElementType: ElementTypes = "svg"; 
	static form: React.FC = SVGElementForm;

	elementGroup: G = new G();
	style: ISVGStyle;
    path: string;
	override svg: Element;

    constructor(params: RecursivePartial<ISVG>, templateName: string="default") {
		var fullParams: ISVG = FillObject(params, SVGElement.defaults[templateName])
		super(fullParams);

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

		// Synchronise Id
		this.id = this.svg.id();
		this.elementGroup.id(this.id);

		// Configure some attributes 
		this.svg.attr({"preserveAspectRatio": "none"})
		this.svg.children().forEach((c) => {
			c.attr({"vector-effect": "non-scaling-stroke"})
		})
	}

	override getInternalRepresentation(): Element | undefined {
        var deltaX
        var deltaY

		if (this.hasPosition) {
			deltaX  = -this.contentX
			deltaY  = -this.contentY
		} else {
			deltaX = 0
			deltaY = 0
		}

        var internalSVG = this.svg?.clone(true, true).attr({"transform": `translate(${deltaX}, ${deltaY})`});
        internalSVG?.attr({"style": "display: block;"})

        return internalSVG;
    }

    draw(surface: Element) {
		if (this.dirty) {
			// Clear old svg
			if (this.svg) {
				this.svg.remove();
			}


			// Flip svg depending on orientation.
			if (this.isMountable) {
				if (!this.flipped && this.mountConfig?.orientation === Orientation.bottom
					|| this.flipped && this.mountConfig?.orientation === Orientation.top
				) {
					this.flipped = !this.flipped;
					this.verticalFlip();
				}

				if (this.flipped) {
					this.offset = [this.offset[0], -Math.abs(this.offset[1])]
				} else {
					this.offset = [this.offset[0], Math.abs(this.offset[1])]
				}
			}
			

			// Position, size and draw svg.
			this.svg.move(this.drawX, this.drawY);
			this.svg.size(this.contentWidth, this.contentHeight);

			surface.add(this.svg);
		}
    }

	verticalFlip() {
		// https://stackoverflow.com/questions/65514861/transform-is-not-applied-on-embedded-svgs-chrome

        //this.elementGroup.transform({a: 1, b: 0, c: 0, d: -1, e: 0, f: 0})
		this.elementGroup.transform({flip: "y", origin: "center"}, true)

        this.padding = [this.padding[2], this.padding[1], this.padding[0], this.padding[3]]
    }

	// Wtf does this do
	public restructure(data: Partial<ISVG>): void {
		// Path
		this.path = data.path ?? this.path;
		
		// Style:
		this.style = data.style ?? this.style;

		super.restructure(data);
	}
}