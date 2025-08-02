import Aligner from "./aligner";
import logger, { Operations } from "./log";
import Spacial, { Binding, Dimensions } from "./spacial";
import { posPrecision } from "./util";




interface Shift {
    dx?: number,
    dy?: number,
}

export interface Place {
    x?: number,
    y?: number
}


export interface IElement {

}

export interface IPoint extends IElement {
    x?: number,
    y?: number,
}

export interface IStateTarget<T extends IPoint> {
    get state(): T
}


export default class Point implements IPoint, IStateTarget<IPoint> {
    static defaults: {[name: string]: IPoint} = {
        "default": {
            x: undefined,
            y: undefined,
        },
    }

    get state(): IPoint {
        return {
        x: this._x,
        y: this._y,
    }}

    protected _x?: number;
    protected _y?: number;

    private _id: string;
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }

    refName: string;

    bindings: Binding[] = [];  // Investigate (enforce is called from point before bindings=[] is initialised in spacial)

    displaced: boolean=false;

    constructor(x?: number, y?: number, refName: string = "point") {
        this.x = x;
        this.y = y;

        this.refName = refName;

        this._id = Math.random().toString(16).slice(2);
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
    protected set x(val: number | undefined) {
        if (val !== this._x) {
            this._x = val !== undefined ? posPrecision(val) : undefined;
        }
    }
    protected set y(val: number | undefined) {
        if (val !== this._y) {
            this._y = val !== undefined ? posPrecision(val) : undefined;
        }
    }


    move({dx, dy}: Shift) {
        this.x += dx ? dx : 0;
        this.y += dy ? dy : 0;
    }
    place({x, y}: {x?: number, y?: number}) {
        x !== undefined ? this.x = x : {}
        y !== undefined ? this.y = y : {}
    }


    // Helpers:
    get hasPosition(): boolean {
        if (this._x === undefined || this._y === undefined) {
            return false;
        } else {
            return true;
        }
    }

    getPositionByDimension(dim: Dimensions): number | undefined {
        if (dim === Dimensions.X) {
            return this._x;
        } else {
            return this._y;
        }
    }
}