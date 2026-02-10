import { Element, SVG, Element as SVGElement } from "@svgdotjs/svg.js";
import TeXToSVG from "tex-to-svg";
import { cascadeID } from "./util2";
import Visual, { Display, IVisual } from "./visual";

export const EXTOPX = 38.314;
export const SCALER = 5;

export interface IText extends IVisual {
	text: string;
	style: ITextStyle;
}

export interface ITextStyle {
	fontSize: number;
	colour: string;
	background: string | null;
	display: Display;
}

export type Position = "top" | "right" | "bottom" | "left" | "centre";

export default class Text extends Visual implements IText {
	get state(): IText {
		return {
			style: this.style,
			text: this.text,

			...super.state
		};
	}

	intrinsicSize: { width: number; height: number };
	wHRatio: number;

	text: string;
	style: ITextStyle;

	constructor(params: IText) {
		super(params);

		this.text = params.text;
		this.style = params.style;

		this.intrinsicSize = this.resolveDimensions();
		this.wHRatio = this.intrinsicSize.width / this.intrinsicSize.height;

		this.contentHeight = ((this.intrinsicSize.height / SCALER) * this.style.fontSize) / EXTOPX;
		this.contentWidth = ((this.intrinsicSize.width / SCALER) * this.style.fontSize) / EXTOPX;

		this.constructSVG();
	}

	constructSVG(): void {
		// Produce tex
		const SVGEquation = TeXToSVG(`${this.text}`); // APPARENTLY this.text is ending up as an int (json parse???)

		var crudeSvg: SVGElement = SVG(SVGEquation);

		var paths: SVGElement[] = crudeSvg.children()[0].children();
		var pathDict: { [id: string]: SVGElement } = {};
		paths.forEach((p) => {
			pathDict[p.id()] = p;
		});

		var structureGroup: SVGElement = crudeSvg.children()[1];

		function replace(svg: SVGElement) {
			var children: SVGElement[] = svg.children();

			children.forEach((c) => {
				if (c.children().length > 0) {
					replace(c);
				} else {
					var childId: string = c.attr("xlink:href") as string;
					var childTransform: string = c.attr("transform") as string;

					if (childId !== undefined && childId[0] == "#") {
						var pathToReplace: SVGElement = pathDict[childId.slice(1)];

						// Apply transform to path
						if (childTransform !== undefined) {
							pathToReplace.attr({ transform: childTransform });
						}

						c.replace(pathToReplace);
					}
				}
			});
		}

		replace(structureGroup);

		crudeSvg.children().forEach((c) => {
			c.remove();
		});
		crudeSvg.add(structureGroup);

		this.svg = crudeSvg;

		this.svg.attr({ height: null, preserveAspectRatio: "xMinYMin" });
		this.svg.width(this.contentWidth!);
		this.svg.attr({ style: `color:${this.style.colour}` });

		var group = this.svg.children()[1];

		if (this.style.background) {
			group.add(
				SVG(`<rect width="100%" height="100%" fill="${this.style.background}"></rect>`),
				0
			);
		}

		cascadeID(this.svg, this.id);
	}

	// TODO: investigate this
	// Sets this.width and this.height
	// Currently needs to add and remove the svg to find these dimensions, not ideal
	resolveDimensions(): { width: number; height: number } {
		var SVGEquation: string = TeXToSVG(`${this.text}`);

		var SVGobj: SVGElement = SVG(SVGEquation);

		SVGobj.id("svgTempID");
		SVGobj.attr({ preserveAspectRatio: "xMinYMin" });

		var exWidthString: string = <string>SVGobj.width();
		var exHeightString: string = <string>SVGobj.height();

		exWidthString = Array.from(exWidthString)
			.splice(0, exWidthString.length - 2)
			.join("");
		exHeightString = Array.from(exHeightString)
			.splice(0, exHeightString.length - 2)
			.join("");

		var exWidth: number = Number(exWidthString);
		var exHeight: number = Number(exHeightString);

		SVGobj.remove();

		return { width: exWidth * EXTOPX, height: exHeight * EXTOPX };
	}

	draw(surface: Element) {
		if (this.dirty) {
			if (this.svg) {
				this.svg.remove();
			}

			this.svg?.move(this.cx, this.cy);

			if (this.svg) {
				surface.add(this.svg);
			}
		}

		super.draw(surface);
	}

	override getInternalRepresentation(): Element | undefined {
		if (this.svg === undefined) {
			return undefined
		}

		var internalSVG = this.svg?.clone(true, true);
		internalSVG?.attr({ style: "display: block;" }).move(0, 0);

		return internalSVG;
	}
}

