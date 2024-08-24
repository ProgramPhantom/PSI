import { Visual, IVisual } from "./visual";
import { IRect } from "./rectElement";
import Spacial, { ISpacial } from "./spacial";

type Padding = number | [number, number] | [number, number, number, number]
type Offset = [number, number]

interface Dim {
    width?: number,
    height?: number
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number
}

export interface IHaveDefault<T> {
    new(params: Partial<any>, templateName?: string): T;
}

export interface IPaddedBox extends ISpacial {
    padding: [number, number, number, number]
}

// After inheriting from this class, x and y are now located away from the actual content, defined by this.padding.
export default abstract class PaddedBox extends Spacial {

    padding: [number, number, number, number] = [0, 0, 0, 0];
    
    constructor(padding: Padding=0, x?: number, y?: number, width?: number, height?: number, refName: string="paddedBox") {
        super(x, y, width, height, refName);

        if (typeof padding === "number") {
            this.padding = [padding, padding, padding, padding]
        } else if (typeof this.padding === "object") {
            if (padding.length === 2) {
                this.padding = [padding[0], padding[1], padding[0], padding[1]]
            } else {
                this.padding = padding;
            }
        }
    }
    
    public get contentX() : number {
        return this.x + this.padding[3];
    }
    public set contentX(v : number) {
        this.x = v - this.padding[3];
        // this._contentX = v;
    }

    public get contentY() : number {
        return this.y + this.padding[0];
    }
    public set contentY(v : number) {
        this.y = v - this.padding[0];
        // this._contentY = v;
    }

    get dim() : Dim {
        return {width: this.width, height: this.height};
    }

    get bounds(): Bounds {
        if (this.hasPosition && this.hasDimensions) {
            var top = this.y;
            var left = this.x;
    
            var bottom = this.y + this.height;
            var right = this.x + this.width;

            return {top: top, right: right, bottom: bottom, left: left};
        }
        throw new Error("Dimensions are unset");
    }


    override get width(): number {
        if (this.contentWidth !== undefined) {
            return this.padding[3] + this.contentWidth + this.padding[1];
        }
        throw new Error("Width unset")
    }
    override get height(): number {
        if (this.contentHeight !== undefined) {
            return this.padding[0] + this.contentHeight + this.padding[2];
        }
        throw new Error("Dimensions undefined")
    }
    
}