import { Defs, Element, Marker, Path, Rect, SVG } from "@svgdotjs/svg.js";
import LineLike, { ILineLike } from "./lineLike";
import { UserComponentType } from "./point";
import { Svg } from "@svgdotjs/svg.js";
import { showSVGRecursively } from "./util2";
import { Size } from "./spacial";


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

	private static readonly MARKER_WIDTHS: Record<HeadStyle, number> = {
		default: 3,
		thin: 2,
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
	private markerDefs?: Defs;

	constructor(params: ILine) {
		super(params);

		this.lineStyle = params.lineStyle;
	}

	public getHitbox(): Rect {
		var hitbox = SVG()
			.rect()
			.id(this.id + "-hitbox")
			.attr({ "data-editor": "hitbox", key: this.ref });

		var startStyle = this.lineStyle?.headStyle?.[0] ?? "none";
		var endStyle = this.lineStyle?.headStyle?.[1] ?? "none";
		var startWidth = Line.MARKER_WIDTHS[startStyle] * this.thickness;
		var endWidth = Line.MARKER_WIDTHS[endStyle] * this.thickness;
		var maxMarkerWidth = Math.max(startWidth, endWidth);

		var hitboxHeight: number = Math.max(this.thickness, maxMarkerWidth) + LineLike.HitboxPadding;
		hitbox.size(this.length, hitboxHeight);
		hitbox.move(this.startX, this.startY - hitboxHeight / 2);
		hitbox.rotate((this.angle / Math.PI) * 180, this.startX, this.startY);

		// hitbox.move(this.x, this.y)
		hitbox.fill(`transparent`).opacity(0.3);
		return hitbox;
	}

	public override computeBoundingBox(): Size {
		if (!this.lineStyle || !this.lineStyle.headStyle) {
			return super.computeBoundingBox();
		}
		let rect: Size = { width: 0, height: 0 };

		var startStyle = this.lineStyle.headStyle[0];
		var endStyle = this.lineStyle.headStyle[1];
		var startWidth = Line.MARKER_WIDTHS[startStyle] * this.thickness;
		var endWidth = Line.MARKER_WIDTHS[endStyle] * this.thickness;
		var maxMarkerWidth = Math.max(startWidth, endWidth);

		let h: number = Math.max(this.thickness, maxMarkerWidth) + LineLike.HitboxPadding;
		let l: number = Math.max(this.length, h);
		let theta: number = this.angle;

		rect.width = l * Math.abs(Math.cos(theta)) + h * Math.abs(Math.sin(theta));
		rect.height = l * Math.abs(Math.sin(theta)) + h * Math.abs(Math.cos(theta));

		return rect;
	}

	public getInternalRepresentation(): Element | undefined {
		if (this.svg === undefined) {
			this.svg = new Svg();  // TODO: fix this
			this.dirty = true;
			this.computeSelf();
			let temporaryCanvas: Element = SVG();
			this.draw(temporaryCanvas);
		}
		if (this.svg === undefined) {
			return undefined;
		}
		var internal: Element = this.svg.clone(true, true);
		internal.attr({ transform: `translate(${-this.drawCX}, ${-this.drawCY})` });
		showSVGRecursively(internal);

		return internal;
	}

	private createMarkerDefs(): Defs {
		var defaultWidth = 3;
		var defaultPath = new Path().attr({
			d: `M 0 0 L ${Line.MARKER_LENGTHS.default} ${defaultWidth / 2} L 0 ${defaultWidth} z`,
			fill: this.lineStyle.stroke
		});
		var defaultMarker = new Marker()
			.id(`default-${this.id}`)
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
			d: `M 0 0 L ${Line.MARKER_LENGTHS.thin} ${thinWidth / 2} L 0 ${thinWidth} z`,
			fill: this.lineStyle.stroke
		});
		var thinMarker = new Marker()
			.id(`thin-${this.id}`)
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
			if (this.markerDefs) {
				this.markerDefs.remove();
			}

			this.markerDefs = this.createMarkerDefs();

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
			var startOffset = this.thickness * startMarkerLength - startAdj;
			var endOffset = this.thickness * endMarkerLength - endAdj;

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
					"marker-start": startStyle !== "none" ? `url(#${startStyle}-${this.id})` : "",
					"marker-end": endStyle !== "none" ? `url(#${endStyle}-${this.id})` : "",
					"stroke-dasharray": `${this.lineStyle.dashing[0]} ${this.lineStyle.dashing[1]}`,
					"stroke-width": `${this.thickness}`
				});

			this.svg = newArrow;


			surface.add(this.svg);
			surface.add(this.markerDefs);
		}
	}

	public override erase(): void {
		super.erase();
		if (this.markerDefs) {
			this.markerDefs.remove();
		}
	}
}
