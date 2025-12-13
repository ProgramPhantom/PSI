import { G, Mask, Rect, Svg } from "@svgdotjs/svg.js";
import Collection, { ICollection, IHaveComponents } from "../collection";
import Line, { ILine } from "../line";
import { UserComponentType } from "../point";
import Spacial, { Dimensions } from "../spacial";
import Text, { IText, Position } from "../text";
import Aligner, { IAligner } from "../aligner";

console.log("Load module label")


interface ILabelComponents extends Record<string, Spacial | Spacial[]> {
	text?: Text;
	line?: Line;
}

export type LabelTextPosition = "top" | "bottom" | "inline";

export interface ILabelConfig {
	labelPosition: Position;
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

	line?: Line;
	text?: Text;

	labelConfig: ILabelConfig;

	constructor(params: ILabel) {
		super(params);
		this.labelConfig = params.labelConfig;

		if (params.text) {
			// Create text
			var text: Text = new Text(params.text);
			text.placementMode = {
				type: "aligner",
				alignerConfig: {
					alignment: "centre"
				}
			}

			this.text = text;
			this.add(text);
		}

		if (params.line) {
			// Create line
			var line: Line = new Line(params.line);
			line.placementMode = {
				type: "aligner",
				alignerConfig: {
					alignment: "centre"
				}
			}
			this.line = line;
		}


		switch (this.labelConfig.labelPosition) {
			case "top":
			case "bottom":
				this.mainAxis = "y";
				break;
			case "left":
			case "right":
				this.mainAxis = "x";
				break;
		}

		if (line !== undefined) {
			// Make line span side:
			line.sizeMode = {
				x: this.crossAxis === "x" ? "grow" : "fixed",
				y: this.crossAxis === "y" ? "grow" : "fixed"
			}

			switch (this.labelConfig.textPosition) {
				case "top":
					this.add(line)
					break;
				case "inline":
					line.placementMode = {
						type: "aligner",
						alignerConfig: {
							alignment: "centre",
							contribution: {mainAxis: false, crossAxis: true}
						}
					}
					this.add(line)
					break;
				case "bottom":
					this.add(line, 0);
				
			}
		}
		

		// this.arrangeContent(orientationSelect);
	}

	draw(surface: Svg) {
		if (this.svg) {
			this.svg.remove();
		}

		// Todo: sort ts out, label children need to be groupedLa
		var group = new G().id(this.id).attr({title: this.ref});

		// Clip

		if (this.line) {
			this.line.draw(group);
		}

		if (this.text) {
			this.text.draw(group);

			const SPILL_PADDING = 4;
			const TEXT_PADDING = 1;

			if (
				this.line
				&& this.line.svg !== undefined
				&& this.text.svg
			) {
				var maskID: string = this.id + "-MASK";
				var visibleArea = new Rect()
					.move(this.x - SPILL_PADDING, this.y - SPILL_PADDING)
					.size(this.width + 2 * SPILL_PADDING, this.height + 2 * SPILL_PADDING)
					.fill("white");
				var blockedArea = new Rect()
					.move(
						this.text.x - TEXT_PADDING,
						this.text.y - TEXT_PADDING
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
					.attr({"mask-type": "luminance", maskUnits: "userSpaceOnUse"});

				// VERY IMPORTANT: use "useSpaceOnUse" to follow the user coordinates not some random bs coord system

				group.add(newMask);

				this.line.svg.attr({mask: `url(#${maskID})`});
			}
		}

		this.svg = group;
		surface.add(this.svg)
	}
}
