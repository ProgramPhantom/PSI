export type OwnershipType = "component" | "free";
export type ID = string;
export const BAR_MASK_ID = "global-bar-mask";


// All component types
export type AllComponentTypes = UserComponentType | AbstractComponentTypes;

// The types of component
export type UserComponentType =
	| DrawComponent
	| "label-group"
	| "label"
	| "text"
	| "line"
	| "channel"
	| "sequence-aligner"
	| "sequence"
	| "diagram";
export type DrawComponent = "svg" | "rect" | "space";

// Abstract component types (have no visual content)
export type AbstractComponentTypes = "aligner" | "collection" | "lower-abstract" | "visual" | "grid";

interface Shift {
	dx?: number;
	dy?: number;
}

export interface Place {
	x?: number;
	y?: number;
}

export interface IElement {
	ref: string;
	id?: ID;
	type: AllComponentTypes;
	parentId?: ID;
}

export interface IPoint extends IElement {
	x?: number;
	y?: number;
}

export interface IHaveState<T extends IPoint> {
	get state(): T;
}

export default class Point implements IPoint, IHaveState<IPoint> {
	static ElementType: AllComponentTypes = "lower-abstract";
	get state(): IPoint {
		return {
			x: this._x,
			y: this._y,
			ref: this.ref,
			id: this.id,
			type: (this.constructor as typeof Point).ElementType,
			parentId: this.parentId
		};
	}

	protected _x: number;
	protected _y: number;

	private _id: ID;
	public get id(): ID {
		return this._id;
	}
	public set id(value: ID) {
		this._id = value;
	}
	public parentId: ID | undefined;

	ref: string;
	public type: AllComponentTypes;

	constructor(params: IPoint) {
		this._x = params.x ?? 0;
		this._y = params.y ?? 0;

		this.ref = params.ref;

		if (params.id === undefined) {
			this._id = Math.random().toString(16).slice(2);
		} else {
			this._id = params.id;
		}

		this.type = (this.constructor as typeof Point).ElementType
		this.parentId = params.parentId;
	}

	get x(): number {
		return this._x;
	}
	get y(): number {
		return this._y;
	}
	public set x(val: number) {
		this._x = val;
	}
	public set y(val: number) {
		this._y = val;
	}

	move({ dx, dy }: Shift) {
		this.x += dx ? dx : 0;
		this.y += dy ? dy : 0;
	}
	place({ x, y }: { x?: number; y?: number }) {
		x !== undefined ? (this.x = x) : {};
		y !== undefined ? (this.y = y) : {};
	}
}
