import { Element } from "@svgdotjs/svg.js";
import { Dimensions, Size } from "./spacial";
import Visual, { IVisual } from "./visual";

console.log("Load module line like")

type Direction = "along" | "cross";

export interface ILineLike extends IVisual {
	adjustment: [number, number];
	thickness?: number;

	x2?: number,
	y2?: number
}

export default abstract class LineLike extends Visual {
	get state(): ILineLike {
		return {
			adjustment: this.adjustment,
			...super.state
		};
	}
	static HitboxPadding: number = 2;

	adjustment: [number, number];
	thickness: number;

	private _x2: number;
	private _y2: number;

	constructor(params: ILineLike) {
		super(params);

		this.adjustment = params.adjustment;

		this.x2 = params.x2 ?? 0
		this.y2 = params.y2 ?? 0

		this.thickness = params.thickness ?? 1;
	}


	public set(x1: number, y1: number, x2: number, y2: number) {
		this.x = x1;
		this.y = y1;

		this.x2 = x2;
		this.y2 = y2;

		
	}

	abstract draw(surface: Element): void;


	public override computeSize(): Size {
		return {width: this.thickness, height: this.thickness}
	}

	public override computePositions(root: { x: number; y: number; }): void {
		super.computePositions(root)
	}

	public override growElement(containerSize: Size): Record<Dimensions, number> {

		return super.growElement(containerSize);
	}

	public get length(): number {
		return Math.sqrt(Math.pow(this.x2 - this.x, 2) + Math.pow(this.y2 - this.y, 2));
	}

	public get angle(): number {
		var dx = this.x2 - this.x;
		var dy = this.y2 - this.y;

		var angle = Math.atan2(dy, dx);
		return angle;
	}

	public get quadrant(): 0 | 1 | 2 | 3 {
		if (this.x2 >= this.x && this.y2 >= this.y) {
			return 0;
		} else if (this.x2 < this.x && this.y2 >= this.y) {
			return 1;
		} else if (this.x2 < this.x && this.y2 < this.y) {
			return 2;
		} else if (this.x2 >= this.x && this.y2 < this.y) {
			return 3;
		}
	}

	public get startX(): number {
		return this.contentX;
	}
	public get startY(): number {
		return this.contentY;
	}

	public get endX(): number {
		return this.getFar("x", true);
	}
	public get endY(): number {
		return this.getFar("y", true);
	}


	public moveRelative(
		coordinate: [number, number],
		direction: Direction,
		quantity: number
	): [number, number] {
		var newCoord: [number, number];
		var dy: number = Math.sin(this.angle!) * quantity;
		var dx: number = Math.cos(this.angle!) * quantity;

		if (direction === "along") {
			newCoord = [coordinate[0] + dx, coordinate[1] + dy];
		} else {
			newCoord = [coordinate[0] + dy, coordinate[1] + dx];
		}
		return newCoord;
	}

	public get x2(): number {
		return this._x + this.width;
	}
	public get y2(): number {
		return this._y + this.height;
	}
	public set x2(v: number) {
		this._x2 = v;
	}
	public set y2(v: number) {
		this._y2 = v;
	}

	// public override get contentWidth(): number {
	// 	return Math.max(Math.abs(this.x2 - this.x), this.thickness)
	// }
	public override set contentWidth(v: number) {
		// this.x2 = this.x + v;
		this._contentWidth = v;
	}

	// public override get contentHeight(): number {
	// 	return Math.max(Math.abs(this.y2 - this.y), this.thickness)
	// }
	public override set contentHeight(v: number) {
		// this.y2 = this.y + v;
		this._contentHeight = v;
	}


	// Anchors:
	public override getNear(dimension: Dimensions, ofContent: boolean = false): number {
		switch (dimension) {
			case "x":
				if (ofContent) {
					return this.contentX;
				}
				return this._x;
			case "y":
				if (ofContent) {
					return this.contentY;
				}
				return this._y;
		}
	}
	public override setNear(dimension: Dimensions, v: number) {
		switch (dimension) {
			case "x":
				this.x = v;
				break;
			case "y":
				this.y = v;
				break;
		}
	}
	public override getCentre(
		dimension: Dimensions,
		ofContent: boolean = false
	): number {
		switch (dimension) {
			case "x":
				if (ofContent) {
					return (
						this.contentX
						+ (this.contentWidth ? this.contentWidth / 2 : 0)
					);
				}
				return this.x + this.width / 2;
			case "y":
				if (ofContent) {
					return (
						this.contentY
						+ (this.contentHeight ? this.contentHeight / 2 : 0)
					);
				}
				return this.y + this.height / 2;
		}
	}
	public override setCentre(dimension: Dimensions, v: number) {
		switch (dimension) {
			case "x":
				this.x = v - this.width / 2;
				break;
			case "y":
				this.y = v - this.height / 2;
				break;
		}
	}
	public override getFar(dimension: Dimensions, ofContent: boolean = false): number {
		switch (dimension) {
			case "x":
				// if (ofContent) { return this.contentX + (this.contentWidth ? this.contentWidth : 0); }
				return this.x2;
			case "y":
				// if (ofContent) { return this.contentY + (this.contentHeight ? this.contentHeight : 0); }
				return this.y2;
		}
	}
	public override setFar(dimension: Dimensions, v: number) {
		switch (dimension) {
			case "x":
				this.x2 = v;
				break;
			case "y":
				this.y2 = v;
				break;
		}
	}



}
