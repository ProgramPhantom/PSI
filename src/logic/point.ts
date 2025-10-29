import { AllComponentTypes } from "./diagramHandler";
import { Dimensions, IBinding } from "./spacial";
import { posPrecision } from "./util";

export type OwnershipType = "component" | "free";
export type ID = string;

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
	type?: AllComponentTypes;
}

export interface IPoint extends IElement {
	x?: number;
	y?: number;
}

export interface IHaveState<T extends IPoint> {
	get state(): T;
}

export default class Point implements IPoint, IHaveState<IPoint> {
	static defaults: {[name: string]: IPoint} = {
		default: {
			x: undefined,
			y: undefined,
			ref: "default"
		}
	};
	static ElementType: AllComponentTypes = "lower-abstract";

	get state(): IPoint {
		return {
			x: this._x,
			y: this._y,
			ref: this.ref,
			id: this.id,
			type: (this.constructor as typeof Point).ElementType
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


	bindings: IBinding[] = []; // Investigate (enforce is called from point before bindings=[] is initialised in spacial)
	bindingsToThis: IBinding[] = [];


	constructor(x?: number, y?: number, ref: string = "point", id: ID | undefined = undefined) {
		this.x = x ?? 0;
		this.y = y ?? 0;

		this.ref = ref;

		if (id === undefined) {
			this._id = Math.random().toString(16).slice(2);
		} else {
			this._id = id;
		}
	}

	get x(): number {
		return this._x;
	}
	get y(): number {
		return this._y;
	}
	public set x(val: number) {
		this._x =  posPrecision(val);
	}
	public set y(val: number) {
		this._y = posPrecision(val);
	}

	move({dx, dy}: Shift) {
		this.x += dx ? dx : 0;
		this.y += dy ? dy : 0;
	}
	place({x, y}: {x?: number; y?: number}) {
		x !== undefined ? (this.x = x) : {};
		y !== undefined ? (this.y = y) : {};
	}

	getPositionByDimension(dim: Dimensions): number | undefined {
		if (dim === "x") {
			return this._x;
		} else {
			return this._y;
		}
	}
}
