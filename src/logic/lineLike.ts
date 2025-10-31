import { Element } from "@svgdotjs/svg.js";
import { Dimensions } from "./spacial";
import Visual, { IVisual } from "./visual";

console.log("Load module line like")

type Direction = "along" | "cross";

export interface ILineLike extends IVisual {
	adjustment: [number, number];
}

export default abstract class LineLike extends Visual {
	get state(): ILineLike {
		return {
			adjustment: this.adjustment,
			...super.state
		};
	}
	public AnchorFunctions = {
		here: {
			get: this.getNear.bind(this),
			set: this.setNear.bind(this)
		},
		centre: {
			get: this.getCentre.bind(this),
			set: this.setCentre.bind(this)
		},
		far: {
			get: this.getFar.bind(this),
			set: this.setFar.bind(this)
		}
	};
	static HitboxPadding: number = 2;

	adjustment: [number, number];
	orientation: Orientation;

	private _x2?: number;
	private _y2?: number;

	constructor(params: ILineLike) {
		super(params);
		this.ref = "LINE";

		this.adjustment = params.adjustment;
		this.orientation = params.orientation;

	}

	resolveDimensions(): void {
		if (this.hasPosition === false) {
			return;
		}

		var width = this.x2 - this.x;
		var height = this.y2 - this.y;

		if (width === 0) {
			width = 1;
		}
		if (height === 0) {
			height = 1;
		}

		this.width = width;
		this.height = height;
	}

	public set(x1: number, y1: number, x2: number, y2: number) {
		this.x = x1;
		this.y = y1;

		this.x2 = x2;
		this.y2 = y2;

		this.adjust();
		this.resolveDimensions();
	}

	adjust() {
		switch (this.orientation) {
			case "vertical":
				this.y -= this.adjustment[0];
				this.y2 += this.adjustment[1];
				break;
			case "horizontal":
				this.x -= this.adjustment[0];
				this.x2 += this.adjustment[1];
				break;
			case "angled":
				throw new Error("Not implementated"); // TODO: implement this
				break;
		}
	}

	abstract draw(surface: Element): void;

	public get length(): number | undefined {
		if (
			this.x === undefined
			|| this.y === undefined
			|| this.y2 === undefined
			|| this.x2 === undefined
		) {
			return undefined;
		}

		return Math.sqrt(Math.pow(this.x2 - this.x, 2) + Math.pow(this.y2 - this.y, 2));
	}

	public get angle(): number | undefined {
		if (
			this.x === undefined
			|| this.y === undefined
			|| this.y2 === undefined
			|| this.x2 === undefined
		) {
			return undefined;
		}

		var dx = this.x2 - this.x;
		var dy = this.y2 - this.y;

		var angle = Math.atan2(dy, dx);
		return angle;
	}

	public get quadrant(): 0 | 1 | 2 | 3 | undefined {
		if (
			this.x === undefined
			|| this.y === undefined
			|| this.y2 === undefined
			|| this.x2 === undefined
		) {
			return undefined;
		}

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

	get hasPosition(): boolean {
		if (
			this._x === undefined
			|| this._y === undefined
			|| this._x2 === undefined
			|| this._y2 === undefined
		) {
			return false;
		} else {
			return true;
		}
	}

	get x(): number {
		if (this._x !== undefined) {
			return this._x;
		}
		throw new Error("x unset");
	}
	get y(): number {
		if (this._y !== undefined) {
			return this._y;
		}
		throw new Error("y unset");
	}
	set x(val: number | undefined) {
		if (val !== this._x) {
			this._x = val !== undefined ? val : undefined;
			this.enforceBinding();
			// this.resolveDimensions();
		}
	}
	set y(val: number | undefined) {
		if (val !== this._y) {
			this._y = val !== undefined ? val : undefined;
			this.enforceBinding();
			// this.resolveDimensions();  Removing this fixes stuff? Don't know why lol
		}
	}

	public get x2(): number {
		if (this._x2 !== undefined) {
			return this._x2;
		}
		throw new Error("x2 unset");
	}
	public get y2(): number {
		if (this._y2 !== undefined) {
			return this._y2;
		}
		throw new Error("y2 unset");
	}
	public set x2(v: number) {
		if (v !== this._x2) {
			this._x2 = v;
			this.enforceBinding();
			this.resolveDimensions();
		}
	}
	public set y2(v: number) {
		if (v !== this._y2) {
			this._y2 = v;
			this.enforceBinding();
			this.resolveDimensions();
		}
	}

	// Anchors:
	public override getNear(dimension: Dimensions, ofContent: boolean = false): number | undefined {
		switch (dimension) {
			case "x":
				if (this._x === undefined) {
					return undefined;
				}
				if (ofContent) {
					return this.contentX;
				}
				return this._x;
			case "y":
				if (this._y === undefined) {
					return undefined;
				}
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
	): number | undefined {
		switch (dimension) {
			case "x":
				if (this._x === undefined) {
					return undefined;
				}
				if (ofContent) {
					return (
						this.contentX
						+ (this.contentWidth ? this.contentWidth / 2 : 0)
					);
				}
				return this.x + this.width / 2;
			case "y":
				if (this._y === undefined) {
					return undefined;
				}
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
	public override getFar(dimension: Dimensions, ofContent: boolean = false): number | undefined {
		switch (dimension) {
			case "x":
				if (this._x2 === undefined) {
					return undefined;
				}
				// if (ofContent) { return this.contentX + (this.contentWidth ? this.contentWidth : 0); }
				return this.x2;
			case "y":
				if (this._y2 === undefined) {
					return undefined;
				}
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
