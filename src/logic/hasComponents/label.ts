import { G, Mask, Rect, Svg } from "@svgdotjs/svg.js";
import Aligner, { IAligner } from "../aligner";
import Line, { ILine } from "../line";
import { UserComponentType } from "../point";
import Text, { IText, Position } from "../text";
import { Dimensions } from "../spacial";
import { AlignerElement } from "../visual";


export type LabelTextPosition = "top" | "bottom" | "inline";

export interface ILabelConfig {
	textPosition: LabelTextPosition;
}

export interface ILabel extends IAligner {
	text?: IText;
	line?: ILine;

	labelConfig: ILabelConfig;
}

export default class Label extends Aligner implements ILabel {
	get state(): ILabel {
		return {
			line: this.line?.state,
			text: this.text?.state,
			labelConfig: this.labelConfig,
			...super.state
		};
	}
	static ElementType: UserComponentType = "label";

	line?: AlignerElement<Line>;
	text?: AlignerElement<Text>;

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

		if (params.text) {
			// Create text
			var text: AlignerElement<Text> = new Text(params.text) as AlignerElement<Text>;
			text.placementMode = {
				type: "aligner",
				config: {
					alignment: "centre"
				}
			}

			this.text = text;
			this.add(text);
		}

		if (params.line) {
			// Create line
			let line: AlignerElement<Line> = new Line(params.line) as AlignerElement<Line>;
			line.placementMode = {
				type: "aligner",
				config: {
					alignment: "centre"
				}
			}
			this.line = line;
		}

		this.mainAxis = "y";

		if (this.line !== undefined) {
			// Make line span side:
			this.line.sizeMode = {
				x: this.crossAxis === "x" ? "grow" : "fixed",
				y: this.crossAxis === "y" ? "grow" : "fixed"
			}

			switch (this.labelConfig.textPosition) {
				case "top":
					this.add(this.line)
					break;
				case "inline":
					this.line.placementMode = {
						type: "aligner",
						config: {
							alignment: "centre",
							contribution: { mainAxis: false, crossAxis: true }
						}
					}
					this.add(this.line)
					break;
				case "bottom":
					this.add(this.line, 0);

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
