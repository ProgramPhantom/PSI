import { Element } from "@svgdotjs/svg.js";
import { Dimensions, Size } from "./spacial";
import Visual, { IVisual } from "./visual";

console.log("Load module line like")

type Direction = "along" | "cross";

export interface ILineLike extends IVisual {
	adjustment: [number, number];
	thickness?: number;

	sx?: number;
	sy?: number;

	ex?: number;
	ey?: number;
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

	private _sy: number;
	private _sx: number;
	private _ex: number;
	private _ey: number;

	constructor(params: ILineLike) {
		super(params);

		this.adjustment = params.adjustment;

		// this.startX = params.sx ?? params.x ?? 0;
		// this.startY = params.sy ?? params.y ?? 0;
		this.startX = 0;
		this.startY = 0;

		// this.endX = params.ex ?? 0;
		// this.endY = params.ey ?? 0;

		this.endX = 0;
		this.endY = 0;

		// this._x = this.startX;
		// this._y = this.startY;


		this.thickness = params.thickness ?? 1;
	}


	abstract draw(surface: Element): void;


	public override computeSize(): Size {
		return this.computeBoundingBox();
	}

	public override computePositions(root: { x: number; y: number; }): void {
		super.computePositions(root)
	}

	public override growElement(containerSize: Size): Record<Dimensions, number> {

		return super.growElement(containerSize);
	}

	public computeBoundingBox(): Size {
		let rect: Size = {width: 0, height: 0};

		let h: number = this.thickness + LineLike.HitboxPadding;
		let l: number = Math.max(this.length, this.thickness + LineLike.HitboxPadding);
		let theta: number = this.angle;

		rect.width = l * Math.abs(Math.cos(theta)) + h * Math.abs(Math.sin(theta))
		rect.height = l * Math.abs(Math.sin(theta)) + h * Math.abs(Math.cos(theta))

		return rect
	}

	public get length(): number {
		return Math.sqrt(Math.pow(this.endX - this.startX, 2) + Math.pow(this.endY - this.startY, 2));
	}

	public get angle(): number {
		var dx = this.endX - this.startX;
		var dy = this.endY - this.startY;

		var angle = Math.atan2(dy, dx);
		return angle;
	}

	public get quadrant(): 0 | 1 | 2 | 3 {
		if (this.endX >= this.startX && this.endY >= this.startY) {
			return 0;
		} else if (this.endX < this.startX && this.endY >= this.startY) {
			return 1;
		} else if (this.endX < this.startX && this.endY < this.startY) {
			return 2;
		} else if (this.endX >= this.startX && this.endY < this.startY) {
			return 3;
		} else {
			return 0;
		}
	}


	public get startX(): number {
		return this._sx;
	}
	public set startX(v: number) {
		this._sx = v;
	}

	public get startY(): number {
		return this._sy;
	}
	public set startY(v: number) {
		this._sy = v;
	}

	public get endX(): number {
		return this._ex;
	}
	public set endX(v: number) {
		this._ex = v;
	}

	public get endY(): number {
		return this._ey;
	}
	public set endY(v: number) {
		this._ey = v;
	}

	public get centreX(): number {
		return (this.startX + this.endX) / 2
	}

	public get centreY(): number {
		return (this.startY + this.endY) / 2
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

	public override get contentWidth(): number {
		let val = this.computeBoundingBox().width;
		this._contentWidth = val
		return val;
	}
	public override set contentWidth(v: number) {
		// this.x2 = this.x + v;
		// this._contentWidth = v;
		//throw new Error("not possible")

		let quadrant = this.quadrant;

		if (quadrant === 0 || quadrant === 3) {
			this.endX = this.startX + v;
		} else {
			this.startX = this.endX + v;
		}

		
	}

	public override get contentHeight(): number {
		let val = this.computeBoundingBox().height;
		this._contentHeight = val;
		return val;
	}
	public override set contentHeight(v: number) {
		// this.y2 = this.y + v;
		//this._contentHeight = v;

		// This needs investigating
		let quadrant = this.quadrant;

		if (quadrant === 2 || quadrant === 3) {
			this.endY = this.startY + v;
		} else {
			this.startY = this.endY + v;
		}
		
	}


	public override get x(): number {
		return this.centreX - this.computeBoundingBox().width / 2;
	}
	public override set x(v: number) {
		let currX: number = this.x;
		this.startX += v - currX;
		this.endX += v - currX;
		this._x = v;

	}

	public override get y(): number {
		return this.centreY - this.computeBoundingBox().height / 2;
	}
	public override set y(v: number) {
		let currY: number = this.y;  // Fixes problems
		this.startY += v - currY;
		this.endY += v - currY;
		this._y = v;
	}
}
