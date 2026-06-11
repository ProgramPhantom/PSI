import { Defs, Element, Marker, Path, Rect, SVG } from "@svgdotjs/svg.js";
import LineLike, { ILineLike } from "./lineLike";
import { UserComponentType } from "./point";
import { Svg } from "@svgdotjs/svg.js";
import { showSVGRecursively } from "./util2";


export type HeadStyle = "default" | "thin" | "none"

export interface ILineStyle {
	headStyle: [HeadStyle, HeadStyle];
	stroke: string;
	dashing: [number, number];
}

export interface ILine extends ILineLike {
	lineStyle: ILineStyle;
	x2?: number;
	y2?: number;
}

export default class Line extends LineLike implements ILine {
	static ElementType: UserComponentType = "line";
	private static readonly MARKER_LENGTHS: Record<HeadStyle, number> = {
		default: 3,
		thin: 4,
		none: 0
	};

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

	constructor(params: ILine) {
		super(params);

		this.lineStyle = params.lineStyle;
	}

	public getHitbox(): Rect {
		var hitbox = SVG()
			.rect()
			.id(this.id + "-hitbox")
			.attr({ "data-editor": "hitbox", key: this.ref });

		var hitboxHeight: number = this.thickness + LineLike.HitboxPadding;
		hitbox.size(this.length, hitboxHeight);
		hitbox.rotate((this.angle / Math.PI) * 180, this.x, this.y + hitboxHeight / 2);

		var crossShift: [number, number] = this.moveRelative(
			[this.x, this.y],
			"cross",
			-(this.thickness + LineLike.HitboxPadding) / 2
		);
		hitbox.move(crossShift[0], crossShift[1]);

		// hitbox.move(this.x, this.y)
		hitbox.fill(`transparent`).opacity(0.3);
		return hitbox;
	}

	public getInternalRepresentation(): Element | undefined {
		if (this.svg === undefined) {
			this.svg = new Svg();  // TODO: fix this
		}

		var internal: Element = this.svg.clone(true, true);

		showSVGRecursively(internal);

		return internal;
	}

	private createMarkerDefs(): Defs {
		var defaultWidth = 3;
		var defaultPath = new Path().attr({
			d: `M 0 0 L ${Line.MARKER_LENGTHS.default} ${defaultWidth / 2} L 0 ${defaultWidth} z`
		});
		var defaultMarker = new Marker()
			.id("default")
			.attr({
				refX: "0",
				refY: defaultWidth / 2,
				markerWidth: Line.MARKER_LENGTHS.default,
				markerHeight: Line.MARKER_LENGTHS.default,
				orient: "auto-start-reverse"
			})
			.add(defaultPath);

		var thinWidth = 2;
		var thinPath = new Path().attr({
			d: `M 0 0 L ${Line.MARKER_LENGTHS.thin} ${thinWidth / 2} L 0 ${thinWidth} z`
		});
		var thinMarker = new Marker()
			.id("thin")
			.attr({
				refX: "0",
				refY: thinWidth / 2,
				markerWidth: Line.MARKER_LENGTHS.thin,
				markerHeight: Line.MARKER_LENGTHS.thin,
				orient: "auto-start-reverse"
			})
			.add(thinPath);

		return new Defs().add(defaultMarker).add(thinMarker);
	}

	public override draw(surface: Element): void {
		if (this.dirty) {
			// Clear old svg
			if (this.svg) {
				this.svg.remove();
			}

			var markerDefs = this.createMarkerDefs();

			var startMarkerLength = Line.MARKER_LENGTHS[this.lineStyle.headStyle[0]];
			var endMarkerLength = Line.MARKER_LENGTHS[this.lineStyle.headStyle[1]];

			var startAdj = this.adjustment && this.adjustment[0] !== undefined ? this.adjustment[0] : 0;
			var endAdj = this.adjustment && this.adjustment[1] !== undefined ? this.adjustment[1] : 0;

			var angle = this.angle!;
			var cos = Math.cos(angle);
			var sin = Math.sin(angle);

			// Calculate final points:
			// Default/Thin line start/end is adjusted by their respective marker length to leave room for markers.
			// Positive adjustment extends the line (moves start/end outwards).
			// Negative adjustment shrinks/pulls back the line.
			var startOffset = startMarkerLength - startAdj;
			var endOffset = endMarkerLength - endAdj;

			var adjustedStartX = this.startX + cos * startOffset;
			var adjustedStartY = this.startY + sin * startOffset;
			var adjustedEndX = this.endX - cos * endOffset;
			var adjustedEndY = this.endY - sin * endOffset;

			var pathData: string = `M${adjustedStartX}, ${adjustedStartY}, ${adjustedEndX} ${adjustedEndY}`;

			var startStyle = this.lineStyle.headStyle[0];
			var endStyle = this.lineStyle.headStyle[1];

			var newArrow = SVG()
				.path()
				.id(this.id)
				.attr({
					strokeWidth: `${this.thickness}`,
					stroke: `${this.lineStyle.stroke}`,
					strokeLinecap: "butt",
					d: pathData,
					"marker-start": startStyle !== "none" ? `url(#${startStyle})` : "",
					"marker-end": endStyle !== "none" ? `url(#${endStyle})` : "",
					"stroke-dasharray": `${this.lineStyle.dashing[0]} ${this.lineStyle.dashing[1]}`,
					"stroke-width": `${this.thickness}`
				});

			this.svg = newArrow;


			surface.add(this.svg);
			surface.add(markerDefs);
		}
	}
}
