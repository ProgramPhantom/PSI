import { SVG, Element as SVGElement, Svg, off } from '@svgdotjs/svg.js'
import SVGPulse from './pulses/image/svgPulse'
import Point, { BinderSetFunction, } from './point'

interface Dim {
    width?: number,
    height?: number
}

interface Shift {
    dx?: number,
    dy?: number,
}

interface Place {
    x?: number,
    y?: number
}

export enum Dimension {
    X="x",
    Y="y"
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number
}

type Padding = number | [number, number] | [number, number, number, number]
export type Offset = [number, number]

export interface IDraw {
    draw(surface: Svg): void
}

export interface IElement {
    padding: [number, number, number, number],
    offset: [number, number],
}




export abstract class Element extends Point {
    AnchorFunctions = {
        "here": {
            // Anchors:
            get: this.getNear,
            set: this.setNear
        },
        "centre": {
            get: this.getCentre,
            set: this.setCentre,
        },
        "far": {
            get: this.getFar,
            set: this.setFar
        }
    }

    protected _contentDim: Dim = {};

    offset: number[];

    id: string;
    dirty: boolean = true;

    constructor(offset: Offset=[0, 0], x?: number, y?: number, dim?: Dim) {
        super(x, y);  // Will make dirty??

        this.offset = [...offset];  // Fixed for some reason
        if (dim) {
            this.contentDim = dim;
        }

        this.id = Math.random().toString(16).slice(2);
    }

    abstract resolveDimensions(): void
    abstract draw(surface: Svg, ...args: any[]): void

    move({dx, dy}: Shift) {
        this.x += dx ? dx : 0;
        this.y += dy ? dy : 0;

        this.enforceBinding();
    }

    place({x, y}: Place) {
        this.x = x ? x : this.x;
        this.y = y ? y : this.y;

        this.enforceBinding();
    }


    set x(val: number) {
        this.dirty = true;
        this._x = val;
    }
    set y(val: number) {
        this.dirty = true;
        this._y = val;
    }


    get contentBounds(): Bounds {
        var top = this.y;
        var left = this.x;

        var bottom = this.y + this.contentHeight;
        var right = this.x + this.contentWidth;

        return {top: top, right: right, bottom: bottom, left: left}
    }

    set contentDim(b: Dim)  {
        this._contentDim = {width: b.width, height: b.height};
    }
    get contentDim(): Dim {
        if (this._contentDim) {
            return this._contentDim;
        }

        throw new Error("dimensions unset");
    }


    get width(): number {
        if (this.contentDim.width) {
            return this.contentWidth;
        }
        throw new Error("Width unset")
    }
    get height(): number {
        if (this.contentDim.height) {
            return this.contentHeight;
        }
        throw new Error("Dimensions undefined")
    }

    get contentWidth(): number {
        if (this._contentDim.width) {
            return this._contentDim.width;
        }
        throw new Error("Width unset")
    }
    set contentWidth(width: number) {
        this._contentDim.width = width;
    }
    get contentHeight(): number {
        if (this._contentDim.height) {
            return this._contentDim.height;
        }
        throw new Error("Height unset")
    }
    set contentHeight(height: number) {
        this._contentDim.height = height;
    }


    // Helpers
    get hasDimensions(): boolean {
        if (!this.contentDim.height || !this.contentDim.height) {
            return false;
        } else {
            return true;
        }
    }
    get hasPosition(): boolean {
        if (!this._x || !this._y) {
            return false;
        } else {
            return true;
        }
    }

    // Anchors:
    public getNear(dimension: Dimension): number {
        switch (dimension) {
            case Dimension.X:
                return this.x;
            case Dimension.Y:
                return this.y;
        }
    }
    public setNear(dimension: Dimension, v : number) {
        switch (dimension) {
            case Dimension.X:
                this.x = v;
                break;
            case Dimension.Y:
                this.y = v;
                break;
        }
    }

    public getCentre(dimension: Dimension): number {
        switch (dimension) {
            case Dimension.X:
                return this.x + this.width/2;
                break;
            case Dimension.Y:
                return this.y + this.height/2;
        }
    }
    public setCentre(dimension: Dimension, v : number) {
        switch (dimension) {
            case Dimension.X:
                this.x = v - this.width/2;
                break;
            case Dimension.Y:
                this.y = v - this.height/2;
                break;
        }
    }

    public getFar(dimension: Dimension): number {
        switch (dimension) {
            case Dimension.X:
                return this.x + this.width;
            case Dimension.Y:
                return this.y + this.height;
        }
    }
    public setFar(dimension: Dimension, v : number) {
        switch (dimension) {
            case Dimension.X:
                this.x = v - this.width;
                break;
            case Dimension.Y:
                this.y = v - this.height;
                break;
        }
    }
    
}