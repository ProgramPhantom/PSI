import { Element, Rect, SVG, Element as SVGElement, Svg } from "@svgdotjs/svg.js";
import { cascadeID } from "./util2";
import { UserComponentType } from "./point";
import { TextBase, ITextBase, PT_TO_PX, TEX_EX_TO_EM } from "./textBase";

const MISSING_ASSET: Record<string, string> = import.meta.glob("../assets/app/MissingAsset2.svg", {
	query: "?raw",
	import: "default",
	eager: true
});
const MISSING_ASSET_SVG_DATA: string = MISSING_ASSET["../assets/app/MissingAsset2.svg"];

export interface CachedTeXData {
	rawSvg: string;
	exWidth: number;
	exHeight: number;
	isExUnit: boolean;
	templateSvg?: string;
}

const texCache = new Map<string, CachedTeXData>();

export async function waitForMathJax(timeoutMs = 60000): Promise<boolean> {
	const startTime = Date.now();
	while (Date.now() - startTime < timeoutMs) {
		const mathjax = (window as any).MathJax;
		if (mathjax && typeof mathjax.tex2svg === "function") {
			if (mathjax.startup?.promise) {
				try {
					await mathjax.startup.promise;
				} catch (e) {
					console.warn("MathJax startup promise error:", e);
				}
			}
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	console.warn(`MathJax did not finish loading within ${timeoutMs}ms`);
	return false;
}

function renderTeXToRawSVG(tex: string): { svg: string; canCache: boolean } {
	const mathjax = (window as any).MathJax;
	if (mathjax && typeof mathjax.tex2svg === "function") {
		try {
			const container = mathjax.tex2svg(tex);
			const svg = container.querySelector("svg");
			if (svg) {
				return {
					svg: new XMLSerializer().serializeToString(svg),
					canCache: true
				};
			}
		} catch (e) {
			console.error("MathJax conversion error:", e);
			return {
				svg: MISSING_ASSET_SVG_DATA,
				canCache: true // Malformed TeX syntax errors will not change on retry
			};
		}
	}
	return {
		svg: MISSING_ASSET_SVG_DATA,
		canCache: false // MathJax might not have loaded yet
	};
}

export function getOrRenderTeX(tex: string): CachedTeXData {
	const cached = texCache.get(tex);
	if (cached) {
		return cached;
	}

	const { svg: rawSvg, canCache } = renderTeXToRawSVG(tex);

	const SVGobj: SVGElement = SVG(rawSvg);
	SVGobj.attr({ preserveAspectRatio: "xMinYMin" });

	const exWidthString: string = String(SVGobj.width() || "50");
	const exHeightString: string = String(SVGobj.height() || "50");

	const exWidth: number = parseFloat(exWidthString);
	const exHeight: number = parseFloat(exHeightString);
	const isExUnit: boolean = exWidthString.endsWith("ex");

	let templateSvg: string | undefined = undefined;

	// If standard MathJax SVG with defs and structure group, prepare the pre-inlined template
	const firstChildNode = SVGobj.children()[0]?.node;
	if (SVGobj.children().length >= 2 && firstChildNode && firstChildNode.nodeName.toLowerCase() === "defs") {
		const paths: SVGElement[] = SVGobj.children()[0].children();
		const pathDict: { [id: string]: SVGElement } = {};
		paths.forEach((p) => {
			pathDict[p.id()] = p;
		});

		const structureGroup: SVGElement = SVGobj.children()[1];

		const replace = (svg: SVGElement): void => {
			const children: SVGElement[] = svg.children();

			children.forEach((c) => {
				if (c.children().length > 0) {
					replace(c);
				} else {
					const childId: string = c.attr("xlink:href") as string;
					const childTransform: string = c.attr("transform") as string;

					if (childId !== undefined && childId[0] == "#") {
						const pathDef = pathDict[childId.slice(1)];
						if (pathDef !== undefined) {
							const pathToReplace: SVGElement = pathDef.clone(true, true) as SVGElement;

							// Apply transform to path
							if (childTransform !== undefined) {
								pathToReplace.attr({ transform: childTransform });
							}

							// Apply colour placeholder directly as SVG presentation attributes
							// to ensure SVG editors (e.g. Figma) pick it up when populated
							pathToReplace.attr({
								fill: "%%COLOR%%",
								stroke: "%%COLOR%%"
							});

							c.replace(pathToReplace);
						}
					}
				}
			});
		};

		replace(structureGroup);

		SVGobj.children().forEach((c) => {
			c.remove();
		});
		SVGobj.add(structureGroup);

		templateSvg = new XMLSerializer().serializeToString(SVGobj.node);
	}

	SVGobj.remove();

	const entry: CachedTeXData = {
		rawSvg,
		exWidth,
		exHeight,
		isExUnit,
		templateSvg
	};

	if (canCache) {
		texCache.set(tex, entry);
	}

	return entry;
}

export function TeXToSVG(tex: string): string {
	return getOrRenderTeX(tex).rawSvg;
}

export function clearTeXCache(): void {
	texCache.clear();
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

		const texData = getOrRenderTeX(`${this.text}`);

		// If it's a MathJax SVG (has "ex" unit suffix)
		if (texData.isExUnit) {
			return {
				width: Math.ceil(texData.exWidth * exInPx),
				height: Math.ceil(texData.exHeight * exInPx)
			};
		}

		// If it's the fallback placeholder SVG (does not have "ex" unit)
		// Scale it down to a height of 2ex so it matches normal text size
		const targetHeight = Math.ceil(2.0 * exInPx);
		const aspectRatio = texData.exHeight > 0 ? (texData.exWidth / texData.exHeight) : 1;
		return { width: Math.ceil(targetHeight * aspectRatio), height: targetHeight };
	}

	constructSVG(): void {
		const texData = getOrRenderTeX(`${this.text}`);

		if (texData.templateSvg) {
			const color = this.style.colour || "black";
			const populatedSvg = texData.templateSvg.replaceAll("%%COLOR%%", color);
			this.svg = SVG(populatedSvg);

			this.svg.attr({
				width: this.contentWidth,
				height: this.contentHeight,
				preserveAspectRatio: "xMinYMin",
				fill: color,
				stroke: color,
				style: `color:${color}; overflow: visible; fill:${color}; stroke:${color};`,
			});
		} else {
			// If it's the fallback SVG (e.g. MissingAsset2.svg) or doesn't have the standard MathJax defs/g structure, use it as-is
			this.svg = SVG(texData.rawSvg);
			this.svg.attr({
				width: this.contentWidth,
				height: this.contentHeight,
				preserveAspectRatio: "xMinYMin",
				style: `color:${this.style.colour}; overflow: visible;`
			});
		}

		if (this.style.background) {
			const box = (this.svg as Svg).viewbox();
			const bgRect = new Rect()
				.size(box.width || "100%", box.height || "100%")
				.move(box.x, box.y)
				.fill(this.style.background);
			this.svg.add(bgRect, 0);
		}

		cascadeID(this.svg, this.id);
	}
}
