import { Element } from "@svgdotjs/svg.js";
import Visual, { Display, IVisual } from "./visual";

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

			this.svg?.move(this.cx, this.cy);

			if (this.svg) {
				surface.add(this.svg);
			}
		}

		super.draw(surface);
	}

	override getInternalRepresentation(): Element | undefined {
		if (this.svg === undefined) {
			return undefined;
		}

		var internalSVG = this.svg?.clone(true, true);
		internalSVG?.attr({ style: "display: block;" }).move(0, 0);
		internalSVG.show();

		return internalSVG;
	}
}
