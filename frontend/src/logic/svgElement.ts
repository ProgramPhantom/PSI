import { Element, G, SVG, Svg } from "@svgdotjs/svg.js";
import { UserComponentType } from "./point";
import { cascadeID, showSVGRecursively } from "./util2";
import Visual, { IDraw, IVisual } from "./visual";


const MISSING_ASSET: Record<string, string> = import.meta.glob("../assets/app/MissingAsset2.svg", {
	query: "?raw",
	import: "default",  // this is important as it means the file is not imported as a "module".
	eager: true
});
const MISSING_ASSET_SVG_DATA: string = MISSING_ASSET["../assets/app/MissingAsset2.svg"];

interface ISVGStyle { }

export interface ISVGElement extends IVisual {
	asset: { ref: string; id: string };
	style: ISVGStyle;
}

export default class SVGElement extends Visual implements ISVGElement, IDraw {
	get state(): ISVGElement {
		return {
			asset: this.asset,
			style: this.style,
			...super.state
		};
	}
	static ElementType: UserComponentType = "svg";


	elementGroup: G = new G();
	style: ISVGStyle;
	asset: { ref: string; id: string };


	constructor(params: ISVGElement) {
		super(params);

		this.style = params.style;
		this.asset = params.asset;
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

		internalSVG.show()
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

		// Apply flip based on this.flipped
		if (this.flipped) {
			this.elementGroup.transform({ flip: "y", origin: "center" });
		} else {
			this.elementGroup.transform({});
		}

		// Position, size and draw svg.
		this.svg.move(this.drawCX, this.drawCY);
		this.svg.size(this.contentWidth, this.contentHeight);
		//this.svg.attr({"style": 'display: "block"'})
		this.svg.show();
		surface.add(this.svg);


		super.draw(surface);
	}



	public static isSVGElement(obj: any): obj is SVGElement {
		return (obj as SVGElement).asset !== undefined;
	}
}
