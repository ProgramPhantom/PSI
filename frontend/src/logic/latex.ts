import { Element, SVG, Element as SVGElement } from "@svgdotjs/svg.js";
import { cascadeID } from "./util2";
import { UserComponentType } from "./point";
import { TextBase, ITextBase, PT_TO_PX, TEX_EX_TO_EM } from "./textBase";

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


export interface ILaTeX extends ITextBase { }

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
		this.wHRatio = this.intrinsicSize.height > 0 ? (this.intrinsicSize.width / this.intrinsicSize.height) : 1;

		this.contentWidth = this.intrinsicSize.width;
		this.contentHeight = this.intrinsicSize.height;

		this.minContentWidth = this.contentWidth;
		this.minContentHeight = this.contentHeight;

		this.constructSVG();
	}

	resolveDimensions(): { width: number; height: number } {
		const fontSizePx = (this.style.fontSize ?? 12) * PT_TO_PX;
		const exInPx = fontSizePx * TEX_EX_TO_EM;

		const SVGEquation: string = TeXToSVG(`${this.text}`);

		const SVGobj: SVGElement = SVG(SVGEquation);

		SVGobj.id("svgTempID");
		SVGobj.attr({ preserveAspectRatio: "xMinYMin" });

		const exWidthString: string = String(SVGobj.width() || "50");
		const exHeightString: string = String(SVGobj.height() || "50");

		const exWidth: number = parseFloat(exWidthString);
		const exHeight: number = parseFloat(exHeightString);

		SVGobj.remove();

		// If it's a MathJax SVG (has "ex" unit suffix)
		if (exWidthString.endsWith("ex")) {
			return {
				width: Math.ceil(exWidth * exInPx),
				height: Math.ceil(exHeight * exInPx)
			};
		}

		// If it's the fallback placeholder SVG (does not have "ex" unit)
		// Scale it down to a height of 2ex so it matches normal text size
		const targetHeight = Math.ceil(2.0 * exInPx);
		const aspectRatio = exHeight > 0 ? (exWidth / exHeight) : 1;
		return { width: Math.ceil(targetHeight * aspectRatio), height: targetHeight };
	}

	constructSVG(): void {
		// Produce tex
		const SVGEquation = TeXToSVG(`${this.text}`);

		var crudeSvg: SVGElement = SVG(SVGEquation);

		// If it's the fallback SVG (e.g. MissingAsset2.svg) or doesn't have the standard MathJax defs/g structure, use it as-is
		const firstChildNode = crudeSvg.children()[0]?.node;
		if (crudeSvg.children().length < 2 || !firstChildNode || firstChildNode.nodeName.toLowerCase() !== "defs") {
			this.svg = crudeSvg;
			this.svg.attr({
				width: this.contentWidth,
				height: this.contentHeight,
				preserveAspectRatio: "xMinYMin",
				style: `color:${this.style.colour}; overflow: visible;`
			});

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

		this.svg.attr({
			width: this.contentWidth,
			height: this.contentHeight,
			preserveAspectRatio: "xMinYMin",
			style: `color:${this.style.colour}; overflow: visible;`
		});

		if (this.style.background) {
			this.svg.add(
				SVG(`<rect width="100%" height="100%" fill="${this.style.background}"></rect>`),
				0
			);
		}

		cascadeID(this.svg, this.id);
	}
}
