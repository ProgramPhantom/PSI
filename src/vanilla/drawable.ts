import { SVG, Element as SVGElement, Svg, off } from '@svgdotjs/svg.js'

interface Dim {
    width: number,
    height: number
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number

    width: number,
    height: number,
}

export abstract class Drawable {
    private _x: number;
    private _y: number;
    
    private _bounds?: Bounds;

    offset: number[];

    constructor(x: number, y: number, offset: number[]=[0, 0], dim?: Dim) {
        this._x = x;
        this._y = y;

        this.offset = offset;
        if (dim) {
            this.bounds = dim;
        }
    }

    public abstract draw(surface: Svg): void;

    get x(): number {
        return this._x;
    }
    get y(): number {
        return this._y;
    }

    set x(val: number) {
        this._x = val;

        if (this._bounds) {  // Recalculate bounds
            this.bounds = {width: this.width, height: this.height};
        }
    }
    set y(val: number) {
        this._y = val;

        if (this._bounds) {  // Recalculate bounds
            this.bounds = {width: this.width, height: this.height};
        }
    }


    get bounds(): Bounds {
        if (this._bounds) {
            return this._bounds;
        }
        throw new Error("Element has no dimensions");
    }
    set bounds(b: Dim)  {
        var top = this._y;
        var left = this._x;

        var bottom = this._y + b.height;
        var right = this._x + b.width;

        this._bounds = {top: top, right: right, bottom: bottom, left: left, width: b.width, height: b.height};
    }

    get width(): number {
        if (this._bounds) {
            return this._bounds.width;
        }
        throw new Error("Dimensions undefined")
    }
    get height(): number {
        if (this._bounds) {
            return this._bounds.height;
        }
        throw new Error("Dimensions undefined")
    }
}