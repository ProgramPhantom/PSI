import { Element } from "@svgdotjs/svg.js";
import { Dimensions, Size } from "./spacial";
import Visual, { IVisual } from "./visual";


type Direction = "along" | "cross";

export interface ILineLike extends IVisual {
	adjustment: [number, number];
	thickness?: number;

	startX?: number;
	startY?: number;

	endX?: number;
	endY?: number;
}

export default abstract class LineLike extends Visual {
	get state(): ILineLike {
		return {
			adjustment: this.adjustment,
			thickness: this.thickness,
			startX: this.startX,
			startY: this.startY,
			endX: this.endX,
			endY: this.endY,
			...super.state
		};
	}

	public override get isResizable(): boolean {
		return false;
	}

	static HitboxPadding: number = 0;

	adjustment: [number, number];
	thickness: number;

	private _startY: number = 0;
	private _startX: number = 0;
	private _endX: number = 0;
	private _endY: number = 0;

	constructor(params: ILineLike) {
		super(params);

		this.adjustment = params.adjustment ?? [0, 0];

		this.startX = params.startX ?? params.x ?? 0;
		this.startY = params.startY ?? params.y ?? 0;

		this.endX = params.endX ?? 0;
		this.endY = params.endY ?? 0;

		this.thickness = params.thickness ?? 2;

		this.AnchorFunctions = {
			...this.AnchorFunctions,
			start: {
				get: this.getStart.bind(this),
				set: this.setStart.bind(this)
			},
			end: {
				get: this.getEnd.bind(this),
				set: this.setEnd.bind(this)
			}
		};
	}


	abstract draw(surface: Element): void;


	public override computeSize(): Size {
		let boundingBox: Size = this.computeBoundingBox();

		// this.width = boundingBox.width;
		// this.height = boundingBox.height;
		return boundingBox;
	}

	public override computePositions(root: { x: number; y: number; }): void {
		super.computePositions(root)
	}

	public override growElement(containerSize: Size): Record<Dimensions, number> {

		return super.growElement(containerSize);
	}

	public computeBoundingBox(): Size {
		let rect: Size = { width: 0, height: 0 };

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
		return this._startX;
	}
	public set startX(v: number) {
		this._startX = v;
		this.dirty = true;
	}

	public get startY(): number {
		return this._startY;
	}
	public set startY(v: number) {
		this._startY = v;
		this.dirty = true;
	}

	public get endX(): number {
		return this._endX;
	}
	public set endX(v: number) {
		this._endX = v;
		this.dirty = true;
	}

	public get endY(): number {
		return this._endY;
	}
	public set endY(v: number) {
		this._endY = v;
		this.dirty = true;
	}

	public getStart(dimension: Dimensions): number {
		return dimension === "x" ? this.startX : this.startY;
	}
	public setStart(dimension: Dimensions, v: number) {
		if (dimension === "x") {
			this.startX = v;
		} else {
			this.startY = v;
		}

	}

	public getEnd(dimension: Dimensions): number {
		return dimension === "x" ? this.endX : this.endY;
	}
	public setEnd(dimension: Dimensions, v: number) {
		if (dimension === "x") {
			this.endX = v;
		} else {
			this.endY = v;
		}

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
		this._contentWidth = val;
		return val;
	}
	public override set contentWidth(v: number) {
		if (this.sizeMode?.x === "fixed" && this.sizeMode?.y === "grow") {
			// Vertical line growing along Y axis - keep X endpoints aligned
			this.endX = this.startX;
			return;
		}

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
		if (this.sizeMode?.y === "fixed" && this.sizeMode?.x === "grow") {
			// Horizontal line growing along X axis - keep Y endpoints aligned
			this.endY = this.startY;
			return;
		}

		let quadrant = this.quadrant;

		if (quadrant === 0 || quadrant === 1) {
			this.endY = this.startY + v;
		} else {
			this.startY = this.endY + v;
		}
	}


	public override get cx(): number {
		return this.centreX - this.computeBoundingBox().width / 2;
	}
	public override set cx(v: number) {
		let currCX: number = this.cx;
		this.startX += v - currCX;
		this.endX += v - currCX;
		this._x = v - this.padding[3];
	}

	public override get cy(): number {
		return this.centreY - this.computeBoundingBox().height / 2;
	}
	public override set cy(v: number) {
		let currCY: number = this.cy;
		this.startY += v - currCY;
		this.endY += v - currCY;
		this._y = v - this.padding[0];
	}

	public override get x(): number {
		return this.cx - this.padding[3];
	}
	public override set x(v: number) {
		this.cx = v + this.padding[3];
		this._x = v;
	}

	public override get y(): number {
		return this.cy - this.padding[0];
	}
	public override set y(v: number) {
		this.cy = v + this.padding[0];
		this._y = v;
	}
}
