import { Element } from "./element";

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


// After inheriting from this class, x and y are now located away from the actual content, defined by this.padding.
export default abstract class PaddedBox extends Element {

    padding: [number, number, number, number] = [0, 0, 0, 0];
    
    constructor(offset: Offset=[0, 0], padding: Padding=0, x?: number, y?: number, dim?: Dim) {
        super(offset, x, y, dim);

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
        return this.x + this.padding[0];
    }
    public set contentX(v : number) {
        throw new Error("not implemented")
        // this._contentX = v;
    }

    public get contentY() : number {
        return this.y + this.padding[0];
    }
    public set contentY(v : number) {
        throw new Error("not implemented")
        // this._contentY = v;
    }

    get dim() : Dim {
        return {width: this.width, height: this.height};
    }
    private set dim(v : Dim) {
        throw new Error("Set dimensions by setting contentDim");
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

    get width(): number {
        if (this.contentDim.width) {
            return this.padding[3] + this.contentWidth + this.padding[1];
        }
        throw new Error("Width unset")
    }
    get height(): number {
        if (this.contentDim.height) {
            return this.padding[0] + this.contentHeight + this.padding[2];
        }
        throw new Error("Dimensions undefined")
    }

    // We still want dimensions to be set by only the content dim, so add padding here
    get contentBounds(): Bounds {
        var top = this.y;
        var left = this.x;

        var bottom = this.y + this.contentHeight;
        var right = this.x + this.contentWidth;

        return {top: top, right: right, bottom: bottom, left: left}
    }

    
    
}