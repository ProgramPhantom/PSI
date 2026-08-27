import { Element, SVG, Element as SVGElement } from "@svgdotjs/svg.js";
import { cascadeID } from "./util2";
import { UserComponentType } from "./point";
import { TextBase, ITextBase, PT_TO_PX } from "./textBase";

export interface IText extends ITextBase {
	fontFamily?: string;
}

export class Text extends TextBase implements IText {
	static ElementType: UserComponentType = "text";
	static ascentPadding: number = 1.0;
	static descentPadding: number = 1.0;
	fontFamily: string;
	ascent: number = 0;
	descent: number = 0;

	get state(): IText {
		return {
			...super.state,
			fontFamily: this.fontFamily,
			type: "text"
		};
	}

	constructor(params: IText) {
		super(params);
		this.type = "text";
		this.fontFamily = params.fontFamily ?? "sans-serif";

		this.intrinsicSize = this.resolveDimensions();
		this.wHRatio = this.intrinsicSize.height > 0 ? (this.intrinsicSize.width / this.intrinsicSize.height) : 1;

		this.contentWidth = this.intrinsicSize.width;
		this.contentHeight = this.intrinsicSize.height;

		this.minContentWidth = this.contentWidth;
		this.minContentHeight = this.contentHeight;

		this.constructSVG();
	}

	/**
	 * Measures text dimensions and computes the baseline position (ascent)
	 * using an offscreen HTML5 Canvas 2D context.
	 */
	resolveDimensions(): { width: number; height: number } {
		// Convert typographic points (pt) to SVG/CSS pixels (px)
		const fontSizePx = (this.style.fontSize ?? 12) * PT_TO_PX;

		// Vertical padding buffer to prevent clipping of anti-aliasing pixels and
		// typographic overshoots on curved glyphs (e.g., 'S', 'O', 'C', '8')
		const padY = Math.max(1.0, Math.round(fontSizePx * 0.05));

		// SSR / non-browser fallback
		if (typeof document === "undefined") {
			this.ascent = fontSizePx + padY;
			this.descent = padY;
			return { width: 10, height: fontSizePx + 2 * padY };
		}

		// Create temporary canvas context for accurate font metrics measurement
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			this.ascent = fontSizePx + padY;
			this.descent = padY;
			return { width: 10, height: fontSizePx + 2 * padY };
		}

		ctx.font = `${fontSizePx}px ${this.fontFamily}`;
		const metrics = ctx.measureText(this.text);

		// Extract raw ink bounding box bounds above and below baseline
		const rawAscent = metrics.actualBoundingBoxAscent !== undefined
			? metrics.actualBoundingBoxAscent
			: (fontSizePx * 0.85);
		const rawDescent = metrics.actualBoundingBoxDescent !== undefined
			? metrics.actualBoundingBoxDescent
			: (fontSizePx * 0.15);

		// Apply the vertical padding buffer so the ink doesn't touch the SVG boundary
		const ascent = rawAscent + padY;
		const descent = rawDescent + padY;
		const width = Math.ceil(metrics.width || 1);
		const height = Math.ceil(ascent + descent || fontSizePx + 2 * padY || 12);

		// Store ascent (baseline distance from top) and descent
		this.ascent = ascent;
		this.descent = descent;

		return {
			width,
			height
		};
	}

	/**
	 * Constructs the SVG DOM node for the text element.
	 */
	constructSVG(): void {
		const fontSizePx = (this.style.fontSize ?? 12) * PT_TO_PX;
		const svgNamespace = "http://www.w3.org/2000/svg";
		const crudeSvg = SVG(document.createElementNS(svgNamespace, "svg")) as SVGElement;

		// Text node with baseline positioned at this.ascent
		const textElement = SVG(document.createElementNS(svgNamespace, "text")) as SVGElement;
		textElement.attr({
			"font-family": this.fontFamily,
			"font-size": `${fontSizePx}px`,
			"fill": this.style.colour,
			"x": 0,
			"y": this.ascent,
			"dominant-baseline": "alphabetic"
		});
		textElement.node.textContent = this.text;

		const group = SVG(document.createElementNS(svgNamespace, "g")) as SVGElement;

		// Optional background fill rectangle
		if (this.style.background) {
			const bgRect = SVG(document.createElementNS(svgNamespace, "rect")) as SVGElement;
			bgRect.attr({
				width: this.contentWidth,
				height: this.contentHeight,
				fill: this.style.background
			});
			group.add(bgRect);
		}

		group.add(textElement);
		crudeSvg.add(group);

		this.svg = crudeSvg;
		this.svg.attr({
			width: this.contentWidth,
			height: this.contentHeight,
			preserveAspectRatio: "xMinYMin",
			style: "overflow: visible;" // Ensure anti-aliasing is never clipped by SVG viewport
		});

		cascadeID(this.svg, this.id);
	}
}

export default Text;
