import { Element, G, SVG, Svg } from "@svgdotjs/svg.js";
import { UserComponentType } from "./point";
import { cascadeID } from "./util2";
import Visual, { IDraw, IVisual } from "./visual";


const MISSING_ASSET: Record<string, string> = import.meta.glob("../assets/app/MissingAsset2.svg", {
	query: "?raw",
	import: "default",  // this is important as it means the file is not imported as a "module".
	eager: true
});
const MISSING_ASSET_SVG_DATA: string = MISSING_ASSET["../assets/app/MissingAsset2.svg"];

interface ISVGStyle { }

export interface ISVGElement extends IVisual {
	svgDataRef: string;
	style: ISVGStyle;
}

export default class SVGElement extends Visual implements ISVGElement, IDraw {
	get state(): ISVGElement {
		return {
			svgDataRef: this.svgDataRef,
			style: this.style,
			...super.state
		};
	}
	static ElementType: UserComponentType = "svg";


	elementGroup: G = new G();
	style: ISVGStyle;
	svgDataRef: string;


	constructor(params: ISVGElement) {
		super(params);

		this.style = params.style;
		this.svgDataRef = params.svgDataRef;
	}

	public setSvgData(rawSVG: Element) {
		// Wrap svg contents inside a group for translation.
		var innerSVG = rawSVG.children();
		innerSVG.forEach((c) => {
			this.elementGroup.add(c);
		});

		this.svg = SVG(rawSVG.node.outerHTML)
			.height(this.contentHeight ?? 0)
			.width(this.contentWidth ?? 0);
		this.svg.add(this.elementGroup);


		// Synchronise Id
		this.svg.id(this.id);
		this.elementGroup.id(this.id);

		// Configure some attributes
		this.svg.attr({ preserveAspectRatio: "none" });
		this.svg.children().forEach((c) => {
			c.attr({ "vector-effect": "non-scaling-stroke" });
		});
		cascadeID(this.svg, this.id);
	}

	override getInternalRepresentation(): Element | undefined {
		if (this.svg === undefined) {
			this.svg = SVG(MISSING_ASSET_SVG_DATA);
		}

		var internalSVG = this.svg?.clone(true, true);
		internalSVG?.attr({ style: "display: block;" }).move(0, 0);

		return internalSVG;
	}

	draw(surface: Element) {
		if (this.svg === undefined) {
			this.svg = SVG(MISSING_ASSET_SVG_DATA);
		}


		
		// Clear old svg
		if (this.svg) {
			this.svg.remove();
		}

		// Flip svg depending on orientation.
		// if (
		// 	(!this.flipped && this.mountConfig?.orientation === "bottom")
		// 	|| (this.flipped && this.mountConfig?.orientation === "top")
		// ) {
		// 	this.flipped = !this.flipped;
		// 	this.verticalFlip();
		// }
		// 
		// if (this.flipped) {
		// 	this.offset = [this.offset[0], -Math.abs(this.offset[1])];
		// } else {
		// 	this.offset = [this.offset[0], Math.abs(this.offset[1])];
		// }

		// Position, size and draw svg.
		this.svg.move(this.drawCX, this.drawCY);
		this.svg.size(this.contentWidth, this.contentHeight);
		//this.svg.attr({"style": 'display: "block"'})
		this.svg.show();
		surface.add(this.svg);
		

		super.draw(surface);
	}

	public override setVerticalFlip(flipped: boolean) {
		if (this.flipped === flipped) {
			return
		}
		// https://stackoverflow.com/questions/65514861/transform-is-not-applied-on-embedded-svgs-chrome

		//this.elementGroup.transform({a: 1, b: 0, c: 0, d: -1, e: 0, f: 0})
		this.elementGroup.transform({ flip: "y", origin: "center" }, true);

		this.padding = [this.padding[2], this.padding[1], this.padding[0], this.padding[3]];
		this.flipped = flipped
	}

	public static isSVGElement(obj: any): obj is SVGElement {
		return (obj as SVGElement).svgDataRef !== undefined;
	}
}
