import { Defs, Element, Marker, Path, Rect, SVG } from "@svgdotjs/svg.js";
import defaultLine from "./default/line.json";
import { UserComponentType } from "./diagramHandler";
import LineLike, { ILineLike } from "./lineLike";
import { FillObject, RecursivePartial } from "./util";

export type HeadStyle = "default" | "thin" | "none";

export interface ILineStyle {
	headStyle: [HeadStyle, HeadStyle];
	stroke: string;
	thickness: number;
	dashing: [number, number];
}

export interface ILine extends ILineLike {
	lineStyle: ILineStyle;
	x2?: number;
	y2?: number;
}

export default class Line extends LineLike implements ILine {
	static defaults: {[key: string]: ILine} = {
		default: {...(<ILine>defaultLine)}
	};
	static ElementType: UserComponentType = "line";

	static arbitraryAdjustment: number = 1;
	get state(): ILine {
		return {
			lineStyle: this.lineStyle,
			x2: this.x2,
			y2: this.y2,
			...super.state
		};
	}

	lineStyle: ILineStyle;

	constructor(params: RecursivePartial<ILine>, templateName: string = "default") {
		var fullParams: ILine = FillObject(params, Line.defaults[templateName]);
		super(fullParams);

		this.lineStyle = fullParams.lineStyle;

		if (fullParams.x2 !== undefined) {
			this.x2 = fullParams.x2;
		}
		if (fullParams.y2 !== undefined) {
			this.y2 = fullParams.y2;
		}
	}

	public getHitbox(): Rect {
		var hitbox = SVG()
			.rect()
			.id(this.id + "-hitbox")
			.attr({"data-editor": "hitbox", key: this.ref});

		var hitboxHeight: number = this.lineStyle.thickness + LineLike.HitboxPadding;
		hitbox.size(this.length, hitboxHeight);
		hitbox.rotate((this.angle / Math.PI) * 180, this.x, this.y + hitboxHeight / 2);

		var crossShift: [number, number] = this.moveRelative(
			[this.x, this.y],
			"cross",
			-(this.lineStyle.thickness + LineLike.HitboxPadding) / 2
		);
		hitbox.move(crossShift[0], crossShift[1]);

		// hitbox.move(this.x, this.y)
		hitbox.fill(`transparent`).opacity(0.3);
		return hitbox;
	}

	public getInternalRepresentation(): Element | undefined {
		var internal: Element = this.svg.clone(true, true);

		return internal;
	}

	public override draw(surface: Element): void {
		if (this.dirty) {
			// Clear old svg
			if (this.svg) {
				this.svg.remove();
			}

			var markerLength = 3;
			var markerWidth = 3;
			var markerPath = new Path().attr({
				d: `M 0 0 L ${markerLength} ${markerWidth / 2} L 0 ${markerWidth} z`
			});
			var marker = new Marker()
				.id("head")
				.attr({
					refX: "0",
					refY: markerWidth / 2,
					markerWidth: markerLength,
					markerHeight: markerLength,
					orient: "auto-start-reverse"
				})
				.add(markerPath);
			var markerDefs = new Defs().add(marker);

			var dy = Math.sin(this.angle!) * markerLength;
			var dx = Math.cos(this.angle!) * markerLength;

			var pathData: string = `M${this.x + dx}, ${this.y + dy}, ${this.x2 - dx} ${this.y2 - dy}`;

			var newArrow = SVG()
				.path()
				.id(this.id)
				.attr({
					strokeWidth: `${this.lineStyle.thickness}`,
					stroke: `${this.lineStyle.stroke}`,
					strokeLinecap: "butt",
					d: pathData,
					"marker-start": this.lineStyle.headStyle[0] === "default" ? "url(#head)" : "",
					"marker-end": this.lineStyle.headStyle[1] === "default" ? "url(#head)" : "",
					"stroke-dasharray": `${this.lineStyle.dashing[0]} ${this.lineStyle.dashing[1]}`,
					"stroke-width": `${this.lineStyle.thickness}`
				});

			this.svg = newArrow;


			surface.add(this.svg);
			surface.add(markerDefs);
		}
	}
}
