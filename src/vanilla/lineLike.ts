import { Element, IElement } from "./element";
import { FillObject, RecursivePartial, UpdateObj } from "./util";
import defaultLineLike from "./default/data/lineLike.json";
import { Svg } from "@svgdotjs/svg.js";
import Label from "./label";
import PaddedBox from "./paddedBox";

enum Orientation {
    horizontal="horizontal",
    vertical="vertical",
    angled="angled"
}

export interface ILineLike extends IElement {
    adjustment: [number, number],
    orientation: Orientation
}

export default abstract class LineLike extends PaddedBox {
    static defaults: {[key: string]: ILineLike} = {"default": <any>defaultLineLike}

    adjustment: [number, number];
    orientation: Orientation;
    
    private _x2?: number;
    private _y2?: number;
    
    
    constructor(params: RecursivePartial<ILineLike>, templateName: string="default") {
        var fullParams: ILineLike = FillObject(params, LineLike.defaults[templateName]);
        super(fullParams.offset, fullParams.padding);

        this.adjustment = fullParams.adjustment;
        this.orientation = fullParams.orientation;
    }

    resolveDimensions(): void {
        var width = this.x2 - this.x;
        var height = this.y2 - this.y;
    
        this.contentDim = {height: height, width: width}
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
            case Orientation.vertical:
                this.y -= this.adjustment[0];
                this.y2 += this.adjustment[1];
                break;
            case Orientation.horizontal:
                this.x -= this.adjustment[0];
                this.x2 += this.adjustment[1];
                break;
            case Orientation.angled:
                throw new Error("Not implementated");  // TODO: implement this
                break;
        }
    }

    abstract draw(surface: Svg): void;


    public get x2() : number {
        if (this._x2) {
            return this._x2;
        }
        throw new Error("x2 unset");
    }
    public set x2(v : number) {
        this._x2 = v;
    }
    public get y2() : number {
        if (this._y2) {
            return this._y2;
        }
        throw new Error("y2 unset");
    }
    public set y2(v : number) {
        this._y2 = v;
    }
}