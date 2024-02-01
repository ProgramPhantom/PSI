import { SVG, Element as SVGElement, Svg, off } from '@svgdotjs/svg.js'


export abstract class Drawable {
    private _x: number;
    private _y: number;
    offset: number[];

    constructor(x: number, y: number, offset: number[]=[0, 0]) {
        this._x = x;
        this._y = y;

        this.offset = offset;
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
    }
    set y(val: number) {
        this._y = val;
    }
}