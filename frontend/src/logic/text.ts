import { Element, SVG, Element as SVGElement } from "@svgdotjs/svg.js";
import { cascadeID } from "./util2";
import { UserComponentType } from "./point";
import { TextBase, ITextBase } from "./textBase";

export interface IText extends ITextBase {
	fontFamily?: string;
}

export class Text extends TextBase implements IText {
	static ElementType: UserComponentType = "text";
	fontFamily: string;

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
			return { width: 10, height: this.style.fontSize };
		}

		const svgNamespace = "http://www.w3.org/2000/svg";
		const tempSvg = document.createElementNS(svgNamespace, "svg");
		tempSvg.style.position = "absolute";
		tempSvg.style.visibility = "hidden";
		tempSvg.style.pointerEvents = "none";
		tempSvg.style.left = "-9999px";
		tempSvg.style.top = "-9999px";

		const tempText = document.createElementNS(svgNamespace, "text");
		tempText.setAttribute("font-family", this.fontFamily);
		tempText.setAttribute("font-size", `${this.style.fontSize}px`);
		tempText.textContent = this.text;

		tempSvg.appendChild(tempText);
		document.body.appendChild(tempSvg);
		const bbox = tempText.getBBox();
		document.body.removeChild(tempSvg);

		return {
			width: bbox.width || 1,
			height: bbox.height || this.style.fontSize || 12
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
			"dominant-baseline": "hanging",
			"x": 0,
			"y": 0
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
