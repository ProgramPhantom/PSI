import { Element, SVG, Element as SVGElement } from "@svgdotjs/svg.js";
import { cascadeID } from "./util2";

const MISSING_ASSET: Record<string, string> = import.meta.glob("../assets/app/MissingAsset2.svg", {
	query: "?raw",
	import: "default",
	eager: true
});
const MISSING_ASSET_SVG_DATA: string = MISSING_ASSET["../assets/app/MissingAsset2.svg"];

function TeXToSVG(tex: string): string {
	const mathjax = (window as any).MathJax;
	if (mathjax && typeof mathjax.tex2svg === "function") {
		try {
			const container = mathjax.tex2svg(tex);
			const svg = container.querySelector("svg");
			if (svg) {
				return new XMLSerializer().serializeToString(svg);
			}
		} catch (e) {
			console.error("MathJax conversion error:", e);
		}
	}
	return MISSING_ASSET_SVG_DATA;
}
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

		var exWidthString: string = <string>SVGobj.width() || "50";
		var exHeightString: string = <string>SVGobj.height() || "50";

		var exWidth: number = parseFloat(exWidthString);
		var exHeight: number = parseFloat(exHeightString);

		SVGobj.remove();

		// If it's a MathJax SVG (has "ex" unit suffix)
		if (exWidthString.endsWith("ex")) {
			return { width: exWidth * EXTOPX, height: exHeight * EXTOPX };
		}
		
		// If it's the fallback placeholder SVG (does not have "ex" unit)
		// Scale it down to a height of 2ex so it matches normal text size
		const targetHeight = 2.0 * EXTOPX;
		const aspectRatio = exWidth / exHeight;
		return { width: targetHeight * aspectRatio, height: targetHeight };
	}

	constructSVG(): void {
		// Produce tex
		const SVGEquation = TeXToSVG(`${this.text}`);

		var crudeSvg: SVGElement = SVG(SVGEquation);

		// If it's the fallback SVG (e.g. MissingAsset2.svg) or doesn't have the standard MathJax defs/g structure, use it as-is
		const firstChildNode = crudeSvg.children()[0]?.node;
		if (crudeSvg.children().length < 2 || !firstChildNode || firstChildNode.nodeName.toLowerCase() !== "defs") {
			this.svg = crudeSvg;
			this.svg.attr({ height: null, preserveAspectRatio: "xMinYMin" });
			this.svg.width(this.contentWidth!);
			this.svg.attr({ style: `color:${this.style.colour}` });
			
			if (this.style.background) {
				this.svg.add(
					SVG(`<rect width="100%" height="100%" fill="${this.style.background}"></rect>`),
					0
				);
			}
			cascadeID(this.svg, this.id);
			return;
		}

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
