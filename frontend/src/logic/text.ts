import { Element, SVG, Element as SVGElement } from "@svgdotjs/svg.js";
import { cascadeID } from "./util2";
import { UserComponentType } from "./point";
import { TextBase, ITextBase } from "./textBase";

export interface IText extends ITextBase {
	fontFamily?: string;
}

export class Text extends TextBase implements IText {
	static ElementType: UserComponentType = "text";
	static descentPadding: number = 0.2;
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
		this.wHRatio = this.intrinsicSize.width / this.intrinsicSize.height;

		this.contentWidth = this.intrinsicSize.width;
		this.contentHeight = this.intrinsicSize.height;

		this.constructSVG();
	}

	resolveDimensions(): { width: number; height: number } {
		if (typeof document === "undefined") {
			this.ascent = this.style.fontSize;
			this.descent = 0;
			return { width: 10, height: this.style.fontSize };
		}

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			this.ascent = this.style.fontSize;
			this.descent = 0;
			return { width: 10, height: this.style.fontSize };
		}

		ctx.font = `${this.style.fontSize}px ${this.fontFamily}`;
		const metrics = ctx.measureText(this.text);

		const ascent = metrics.actualBoundingBoxAscent !== undefined ? metrics.actualBoundingBoxAscent : (this.style.fontSize * 0.85);
		const descent = (metrics.actualBoundingBoxDescent !== undefined ? metrics.actualBoundingBoxDescent : (this.style.fontSize * 0.15)) + Text.descentPadding;
		const width = metrics.width || 1;
		const height = ascent + descent || this.style.fontSize || 12;

		this.ascent = ascent;
		this.descent = descent;

		return {
			width,
			height
		};
	}

	constructSVG(): void {
		const svgNamespace = "http://www.w3.org/2000/svg";
		const crudeSvg = SVG(document.createElementNS(svgNamespace, "svg")) as SVGElement;

		const textElement = SVG(document.createElementNS(svgNamespace, "text")) as SVGElement;
		textElement.attr({
			"font-family": this.fontFamily,
			"font-size": `${this.style.fontSize}px`,
			"fill": this.style.colour,
			"x": 0,
			"y": this.ascent
		});
		textElement.node.textContent = this.text;

		const group = SVG(document.createElementNS(svgNamespace, "g")) as SVGElement;

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
			preserveAspectRatio: "xMinYMin"
		});

		cascadeID(this.svg, this.id);
	}
}

export default Text;
