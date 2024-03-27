import { SVG, Element as SVGElement, Svg, off } from '@svgdotjs/svg.js'
import SVGPulse from './pulses/image/svgPulse'

interface Dim {
    width: number,
    height: number
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number
}

export interface IDraw {
    draw(surface: Svg): void
}




export abstract class Element {
    private _x: number;
    private _y: number;
    private _dim?: Dim;

    offset: number[];
    padding: number[]=[0, 0, 0, 0];

    constructor(x: number, y: number, offset: number[]=[0, 0], padding: number | number[]=[0], dim?: Dim) {
        this._x = x;
        this._y = y;

        this.offset = [...offset];  // Fixed for some reason
        if (dim) {
            this.dim = dim;
        }

        if (padding) {
            if (!Array.isArray(padding)) {
                this.padding = [padding, padding, padding, padding]
            } else {
                if (padding.length === 1) {
                    this.padding = [padding[0], padding[0], padding[0], padding[0]]
                } else if (padding.length === 2){
                    this.padding = [padding[0], padding[1], padding[0], padding[1]]
                } else if (padding.length === 3) {
                    this.padding = [padding[0], padding[2], padding[1], padding[2]]
                } else {
                    this.padding = padding;
                }
            }
        }
    }

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

    get bounds(): Bounds {
        var top = this._y;
        var left = this._x;

        var bottom = this._y + this.height;
        var right = this._x + this.width;

        return {top: top, right: right, bottom: bottom, left: left}
    }

    set dim(b: Dim)  {
        this._dim = {width: b.width, height: b.height};
    }

    get width(): number {
        if (this._dim) {
            return this._dim.width;
        }
        throw new Error("Dimensions undefined")
    }
    set width(width: number) {
        if (this._dim) {
            this._dim.width = width;
        }
        throw new Error("Dimensions undefined")
    }
    get height(): number {
        if (this._dim) {
            return this._dim.height;
        }
        throw new Error("Dimensions undefined")
    }
    set height(height: number) {
        if (this._dim) {
            this._dim.height = height;
        }
        throw new Error("Dimensions undefined")
    }


    get px(): number {
        return this._x - this.padding[3];
    }
    get py(): number {
        return this._y - this.padding[0];
    }
    set px(val: number) {
        this._x = val + this.padding[3];
    }
    set py(val: number) {
        this._y = val + this.padding[0];
    }

    get pbounds(): Bounds {
        if (this._dim) {
            var top = this.py;
            var left = this.px;
    
            var bottom = this.py + this.pheight;
            var right = this.px + this.pwidth;

            return {top: top, right: right, bottom: bottom, left: left};
        }
        throw new Error("Element has no dimensions");
    }

    get pwidth(): number {
        if (this._dim) {
            return this.padding[3] + this._dim.width + this.padding[1];
        }
        throw new Error("Dimensions undefined")
    }
    get pheight(): number {
        if (this._dim) {
            return this.padding[0] + this._dim.height + this.padding[2];
        }
        throw new Error("Dimensions undefined")
    }

}