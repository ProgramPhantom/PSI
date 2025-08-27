import { Visual, IVisual, IDraw } from "./visual";
import { svgPulses } from "./default/data/svgPulse";
import { cascadeID, FillObject, RecursivePartial, createWithTemplate } from "./util";
import { Element, Svg } from "@svgdotjs/svg.js";
import { SVG } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";
import { Orientation } from "./mountable";
import Labellable, { ILabellable } from "./labellable";
import SVGElementForm from "../form/SVGElementForm";
import { Rect } from "@svgdotjs/svg.js";
import { UserComponentType } from "./diagramHandler";

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

export interface ISVGElement extends IVisual {
    path: string,
    style: ISVGStyle
}


export default class SVGElement extends Visual implements ISVGElement, IDraw {
    static override namedElements: {[key: string]: ISVGElement} = {...<any>svgPulses, "default": svgPulses[180]};
	get state(): ISVGElement { return {
		path: this.path,
		style: this.style,
		...super.state
    }}
	static ElementType: UserComponentType = "svg";
	static form: React.FC = SVGElementForm;

	elementGroup: G = new G();
	style: ISVGStyle;
    path: string;
	override svg: Element;

    constructor(params: ISVGElement);
    constructor(params: RecursivePartial<ISVGElement>, templateName: string);
    constructor(params: RecursivePartial<ISVGElement> | ISVGElement, templateName?: string) {
		const fullParams = createWithTemplate<ISVGElement>(SVGElement.namedElements)(params, templateName);
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
		cascadeID(this.svg, this.id);
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

        var internalSVG = this.svg?.clone(true, true)
        internalSVG?.attr({"style": "display: block;"}).move(this.offset[0], this.offset[1])

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
				if (!this.flipped && this.mountConfig?.orientation === "bottom"
					|| this.flipped && this.mountConfig?.orientation === "top"
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

			var hitbox = SVG().rect().attr({"data-editor": "hitbox", "zIndex": -1}).x(0).y(0)
								   .width("100%").height("100%").fill("transparent").id(this.id)
								   .stroke("none");
			this.svg.add(hitbox);
			
					

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
	public restructure(data: Partial<ISVGElement>): void {
		// Path
		this.path = data.path ?? this.path;
		
		// Style:
		this.style = data.style ?? this.style;

		super.restructure(data);
	}


}