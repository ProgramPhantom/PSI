import { Defs, Element, G, Marker, Path, Rect, SVG } from "@svgdotjs/svg.js";
import LineLike, { ILineLike } from "./lineLike";
import { UserComponentType } from "./point";
import { Svg } from "@svgdotjs/svg.js";
import { showSVGRecursively } from "./util2";
import { Size } from "./spacial";


export type HeadStyle = "default" | "thin" | "bracket" | "none"

export interface IMarkerWidth {
	left: number;
	right: number;
}

export interface ILineStyle {
	headStyle: [HeadStyle, HeadStyle];
	stroke: string;
	dashing: [number, number];
}

export interface ILine extends ILineLike {
	lineStyle: ILineStyle;
}

export default class Line extends LineLike implements ILine {
	static ElementType: UserComponentType = "line";
	public static readonly BRACKET_ARM_LENGTH: number = 3;

	public static readonly MARKER_LENGTHS: Record<HeadStyle, number> = {
		default: 3,
		thin: 4,
		bracket: 0.5,
		none: 0
	};

	/**
	 * Marker extent perpendicular to the line (in multiples of line thickness),
	 * looking along the line vector from start to end:
	 * - `left`: counter-clockwise from the line vector (-y in local unrotated line coords).
	 * - `right`: clockwise from the line vector (+y in local unrotated line coords).
	 */
	public static readonly MARKER_WIDTHS: Record<HeadStyle, IMarkerWidth> = {
		default: { left: 1.5, right: 1.5 },
		thin: { left: 1, right: 1 },
		bracket: { left: 0.5, right: Line.BRACKET_ARM_LENGTH },
		none: { left: 0.5, right: 0.5 }
	};

	static arbitraryAdjustment: number = 1;
	get state(): ILine {
		return {
			lineStyle: this.lineStyle,
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
		var startMarker = Line.MARKER_WIDTHS[startStyle] ?? Line.MARKER_WIDTHS.none;
		var endMarker = Line.MARKER_WIDTHS[endStyle] ?? Line.MARKER_WIDTHS.none;
		var maxLeftWidth = Math.max(startMarker.left, endMarker.left) * this.thickness;
		var maxRightWidth = Math.max(startMarker.right, endMarker.right) * this.thickness;

		var hitboxHeight: number = maxLeftWidth + maxRightWidth + LineLike.HitboxPadding;
		hitbox.size(this.length, hitboxHeight);
		hitbox.move(this.startX, this.startY - maxLeftWidth - LineLike.HitboxPadding / 2);
		hitbox.rotate((this.angle / Math.PI) * 180, this.startX, this.startY);

		// hitbox.move(this.x, this.y)
		hitbox.fill(`transparent`).opacity(0.3);
		return hitbox;
	}

	public override computeBoundingBox(): { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number } {
		var startStyle = this.lineStyle?.headStyle?.[0] ?? "none";
		var endStyle = this.lineStyle?.headStyle?.[1] ?? "none";
		var startMarker = Line.MARKER_WIDTHS[startStyle] ?? Line.MARKER_WIDTHS.none;
		var endMarker = Line.MARKER_WIDTHS[endStyle] ?? Line.MARKER_WIDTHS.none;

		var maxLeft = Math.max(startMarker.left, endMarker.left) * this.thickness + LineLike.HitboxPadding / 2;
		var maxRight = Math.max(startMarker.right, endMarker.right) * this.thickness + LineLike.HitboxPadding / 2;

		var len = this.length;
		var dx = len > 0 ? (this.endX - this.startX) / len : 1;
		var dy = len > 0 ? (this.endY - this.startY) / len : 0;

		var x1 = this.startX + maxLeft * dy;
		var y1 = this.startY - maxLeft * dx;

		var x2 = this.endX + maxLeft * dy;
		var y2 = this.endY - maxLeft * dx;

		var x3 = this.endX - maxRight * dy;
		var y3 = this.endY + maxRight * dx;

		var x4 = this.startX - maxRight * dy;
		var y4 = this.startY + maxRight * dx;

		var minX = Math.min(x1, x2, x3, x4);
		var maxX = Math.max(x1, x2, x3, x4);
		var minY = Math.min(y1, y2, y3, y4);
		var maxY = Math.max(y1, y2, y3, y4);

		var width = Math.max(maxX - minX, this.thickness);
		var height = Math.max(maxY - minY, this.thickness);

		return {
			minX,
			maxX,
			minY,
			maxY,
			width,
			height
		};
	}



	public override get cx(): number {
		if (!this.lineStyle || !this.lineStyle.headStyle) {
			return super.cx;
		}
		return this.computeBoundingBox().minX;
	}
	public override set cx(v: number) {
		let currCX: number = this.cx;
		let delta = v - currCX;
		this.startX += delta;
		this.endX += delta;
		this._x = v - this.padding[3];
		this.dirty = true;
	}

	public override get cy(): number {
		if (!this.lineStyle || !this.lineStyle.headStyle) {
			return super.cy;
		}
		return this.computeBoundingBox().minY;
	}
	public override set cy(v: number) {
		let currCY: number = this.cy;
		let delta = v - currCY;
		this.startY += delta;
		this.endY += delta;
		this._y = v - this.padding[0];
		this.dirty = true;
	}

	public getInternalRepresentation(containerSize?: Size): Element | undefined {
		if (this.svg === undefined || containerSize !== undefined) {
			this.svg = new Svg();  // TODO: fix this
			this.dirty = true;
			this.computeSelf(containerSize);
			let temporaryCanvas: Element = SVG();
			this.draw(temporaryCanvas);
		}
		if (this.svg === undefined) {
			return undefined;
		}
		var group = new G().id(this.id);
		if (this.markerDefs) {
			group.add(this.markerDefs.clone(true, false));
		}
		var internal: Element = this.svg.clone(true, false);
		internal.attr({ transform: `translate(${-this.drawCX}, ${-this.drawCY})` });
		group.add(internal);
		showSVGRecursively(group);

		return group;
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

		var bracketHeight = Line.BRACKET_ARM_LENGTH;
		var bracketPath = new Path().attr({
			d: `M 0.5 0 L 1.5 0 L 1.5 ${bracketHeight} L 0.5 ${bracketHeight} z`,
			fill: this.lineStyle.stroke
		});
		var bracketMarker = new Marker()
			.id(`bracket-${this.id}`)
			.attr({
				refX: "1",
				refY: "0.5",
				markerWidth: "2",
				markerHeight: `${bracketHeight}`,
				orient: "auto"
			})
			.add(bracketPath);

		return new Defs().add(defaultMarker).add(thinMarker).add(bracketMarker);
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

			var pathData: string = `M ${adjustedStartX} ${adjustedStartY} L ${adjustedEndX} ${adjustedEndY}`;

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
