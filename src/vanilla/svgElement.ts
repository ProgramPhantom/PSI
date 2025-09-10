import { Element, G, SVG } from "@svgdotjs/svg.js";
import { FormBundle } from "../form/LabelGroupComboForm";
import SVGElementForm from "../form/SVGElementForm";
import { svgPulses } from "./default/data/svgPulse";
import { UserComponentType } from "./diagramHandler";
import ENGINE from "./engine";
import { cascadeID, createWithTemplate, RecursivePartial } from "./util";
import { IDraw, IVisual, Visual } from "./visual";
import SchemeManager from "./default";




interface ISVGStyle {

}

export interface ISVGElement extends IVisual {
    svgDataRef: string,
    style: ISVGStyle
}


export default class SVGElement extends Visual implements ISVGElement, IDraw {
    static override namedElements: {[key: string]: ISVGElement} = {...<any>svgPulses, "default": svgPulses[180], 
		"form-defaults": {
			"mountConfig": {
				"orientation": "top",
				"alignment": "centre",
				"noSections": 1,
				"channelID": null,
				"sequenceID": null,
				"index": null,
				"mountOn": false,
			},

			"padding": [0, 0, 0, 0],
			"offset": [0, 0],
			"svgDataRef": "180",
			"contentWidth": 50,
			"contentHeight": 50,

			"ref": "180",
			"style": {}
	}};
	get state(): ISVGElement { return {
		svgDataRef: this.svgDataRef,
		style: this.style,
		...super.state
    }}
	static ElementType: UserComponentType = "svg";
	static formData: FormBundle = {form: SVGElementForm, defaults: SVGElement.namedElements["form-defaults"], allowLabels: true};

	elementGroup: G = new G();
	style: ISVGStyle;
    svgDataRef: string;
	// svg: Element;

    constructor(params: ISVGElement);
    constructor(params: RecursivePartial<ISVGElement>, templateName: string);
    constructor(params: RecursivePartial<ISVGElement> | ISVGElement, templateName?: string) {
		const fullParams = createWithTemplate<ISVGElement>(SVGElement.namedElements)(params, templateName);
		super(fullParams);

		this.style = fullParams.style;
        this.svgDataRef = fullParams.svgDataRef;

		if (this.svgDataRef === "tick") {
			console.log()
		}
		var svgString: string | undefined = ENGINE.schemeManager.svgStrings[this.svgDataRef];
		if (svgString === undefined) {
			console.warn(`Cannot find svg with ref ${this.svgDataRef} so defaulting to missing asset`)
			svgString = SchemeManager.MissingSVGAssetStr;
		}
		try {
			var rawSVG: Element = SVG(svgString)
		} catch {
			console.warn(`Cannot parse svg with ref ${this.svgDataRef} so defaulting to missing asset`)
			var rawSVG: Element = SVG(SchemeManager.MissingSVGAssetStr, true);
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


	public static isSVGElement(obj: any): obj is SVGElement {
		return (obj as SVGElement).svgDataRef !== undefined
	}
}