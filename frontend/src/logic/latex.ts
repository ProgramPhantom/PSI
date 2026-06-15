import { Element, SVG, Element as SVGElement } from "@svgdotjs/svg.js";
import TeXToSVG from "tex-to-svg";
import { cascadeID } from "./util2";
import { UserComponentType } from "./point";
import { TextBase, ITextBase, EXTOPX, SCALER } from "./textBase";

export interface ILaTeX extends ITextBase {}

export class LaTeX extends TextBase implements ILaTeX {
	static ElementType: UserComponentType = "latex";

	get state(): ILaTeX {
		return {
			...super.state,
			type: "latex"
		};
	}

	constructor(params: ILaTeX) {
		super(params);
		this.type = "latex";

		this.intrinsicSize = this.resolveDimensions();
		this.wHRatio = this.intrinsicSize.width / this.intrinsicSize.height;

		this.contentHeight = ((this.intrinsicSize.height / SCALER) * this.style.fontSize) / EXTOPX;
		this.contentWidth = ((this.intrinsicSize.width / SCALER) * this.style.fontSize) / EXTOPX;

		this.constructSVG();
	}

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

	constructSVG(): void {
		// Produce tex
		const SVGEquation = TeXToSVG(`${this.text}`);

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
						var pathDef = pathDict[childId.slice(1)];
						if (pathDef !== undefined) {
							var pathToReplace: SVGElement = pathDef.clone(true, true) as SVGElement;

							// Apply transform to path
							if (childTransform !== undefined) {
								pathToReplace.attr({ transform: childTransform });
							}

							c.replace(pathToReplace);
						}
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
}
