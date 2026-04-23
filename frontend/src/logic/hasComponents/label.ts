import { G, Mask, Rect, Svg } from "@svgdotjs/svg.js";
import Aligner, { IAligner } from "../aligner";
import Line, { ILine } from "../line";
import { UserComponentType } from "../point";
import Text, { IText, Position } from "../text";
import { Dimensions } from "../spacial";
import { AlignerElement } from "../visual";


import { AddDispatchData, Components } from "../collection";

export type LabelTextPosition = "top" | "bottom" | "inline";

export interface ILabelConfig {
	textPosition: LabelTextPosition;
}

export interface ILabel extends IAligner {
	labelConfig: ILabelConfig;
}

export default class Label extends Aligner implements ILabel {
	get state(): ILabel {
		return {
			labelConfig: this.labelConfig,
			...super.state
		};
	}
	static ElementType: UserComponentType = "label";

	get text(): AlignerElement<Text> | undefined {
		return this.roles["text"]?.object as AlignerElement<Text> | undefined;
	}

	get line(): AlignerElement<Line> | undefined {
		return this.roles["line"]?.object as AlignerElement<Line> | undefined;
	}

	roles: Components<AlignerElement> = {
		"text": {
			object: undefined,
			initialiser: this.initialiseText.bind(this)
		},
		"line": {
			object: undefined,
			initialiser: this.initialiseLine.bind(this)
		}
	}

	labelConfig: ILabelConfig;

	public override get mainAxis(): Dimensions {
		return super.mainAxis;
	}
	public override set mainAxis(value: Dimensions) {
		super.mainAxis = value;

		if (this.line !== undefined) {
			this.line.sizeMode = {
				x: this.crossAxis === "x" ? "grow" : "fixed",
				y: this.crossAxis === "y" ? "grow" : "fixed"
			}
		}
	}

	constructor(params: ILabel) {
		super(params);
		this.labelConfig = params.labelConfig;
		this.mainAxis = params.mainAxis ?? "y";
	}

	private initialiseText({ child }: AddDispatchData<AlignerElement>) {
		child.placementMode = {
			type: "aligner",
			config: {
				alignment: "centre"
			}
		}
	}

	private initialiseLine({ child }: AddDispatchData<AlignerElement>) {
		child.placementMode = {
			type: "aligner",
			config: {
				alignment: "centre"
			}
		}

		child.sizeMode = {
			x: this.crossAxis === "x" ? "grow" : "fixed",
			y: this.crossAxis === "y" ? "grow" : "fixed"
		}

		if (this.labelConfig?.textPosition === "inline") {
			child.placementMode = {
				type: "aligner",
				config: {
					alignment: "centre",
					contribution: { mainAxis: false, crossAxis: true }
				}
			}
		} else if (this.labelConfig?.textPosition === "bottom") {
			let currentLineIndex = this.childIndex(child);
			if (currentLineIndex !== undefined && currentLineIndex !== 0) {
				this.children.splice(currentLineIndex, 1);
				this.children.unshift(child);
			}
		}
	}

	draw(surface: Svg) {
		if (this.svg) {
			this.svg.remove();
		}

		// Todo: sort ts out, label children need to be groupedLa
		var group = new G().id(this.id).attr({ title: this.ref });

		// Clip

		if (this.line) {
			this.line.draw(group);
		}

		if (this.text) {
			this.text.draw(group);

			const SPILL_PADDING = 1;
			const TEXT_PADDING = 0;

			if (
				this.line
				&& this.line.svg !== undefined
				&& this.text.svg
			) {
				var maskID: string = this.id + "-MASK";
				var visibleArea = new Rect()
					.move(this.cx - SPILL_PADDING, this.cy - SPILL_PADDING)
					.size(this.contentWidth + 2 * SPILL_PADDING, this.contentHeight + 2 * SPILL_PADDING)
					.fill("white");
				var blockedArea = new Rect()
					.move(
						this.text.cx - TEXT_PADDING,
						this.text.cy - TEXT_PADDING
					)
					.size(
						(this.text.contentWidth ?? 0) + 2 * TEXT_PADDING,
						(this.text.contentHeight ?? 0) + 2 * TEXT_PADDING
					)
					.fill("black");

				var newMask = new Mask()
					.add(visibleArea)
					.add(blockedArea)
					.id(maskID)
					.attr({ "mask-type": "luminance", maskUnits: "userSpaceOnUse" });

				// VERY IMPORTANT: use "useSpaceOnUse" to follow the user coordinates not some random bs coord system

				group.add(newMask);

				this.line.svg.attr({ mask: `url(#${maskID})` });
			}
		}

		this.svg = group;
		surface.add(this.svg)
	}
}
