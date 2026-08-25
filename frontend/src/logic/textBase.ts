import { Element, SVG } from "@svgdotjs/svg.js";
import Visual, { Display, IVisual } from "./visual";
import { Size } from "./spacial";

export const EXTOPX = 38.314;
export const SCALER = 5;

export interface ITextStyle {
	fontSize: number;
	colour: string;
	background: string | null;
	display: Display;
}

export interface ITextBase extends IVisual {
	text: string;
	style: ITextStyle;
}

export type Position = "top" | "right" | "bottom" | "left" | "centre";

export abstract class TextBase extends Visual implements ITextBase {
	text: string;
	style: ITextStyle;
	intrinsicSize!: { width: number; height: number };
	wHRatio!: number;

	get state(): ITextBase {
		return {
			style: this.style,
			text: this.text,
			...super.state
		};
	}

	constructor(params: ITextBase) {
		super(params);
		this.text = params.text;
		this.style = params.style;
	}

	abstract resolveDimensions(): { width: number; height: number };
	abstract constructSVG(): void;

	draw(surface: Element) {
		if (this.dirty) {
			if (this.svg) {
				this.svg.remove();
			}

			this.svg?.move(this.drawCX, this.drawCY);

			if (this.svg) {
				surface.add(this.svg);
			}
		}

		super.draw(surface);
	}

	override getInternalRepresentation(containerSize?: Size): Element | undefined {
		if (this.svg === undefined || containerSize !== undefined) {
			this.computeSelf(containerSize);
			let temporaryCanvas: Element = SVG();
			this.draw(temporaryCanvas);
		}
		if (this.svg === undefined) {
			return undefined;
		}

		var internalSVG = this.svg?.clone(true, true);
		internalSVG?.attr({ style: "display: block;" }).move(0, 0);
		internalSVG.show();

		return internalSVG;
	}
}
