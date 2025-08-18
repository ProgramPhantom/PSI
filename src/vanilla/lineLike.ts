import { Visual, IVisual } from "./visual";
import { FillObject, posPrecision, RecursivePartial, UpdateObj } from "./util";
import defaultLineLike from "./default/data/lineLike.json";
import { Svg } from "@svgdotjs/svg.js";
import Text from "./text";
import PaddedBox from "./paddedBox";
import Spacial, { BindingRule, Dimensions } from "./spacial";

enum Orientation {
    horizontal="horizontal",
    vertical="vertical",
    angled="angled"
}

export interface ILineLike extends IVisual {
    adjustment: [number, number],
    orientation: Orientation
}

export default abstract class LineLike extends Visual {
    static defaults: {[key: string]: ILineLike} = {"default": <any>defaultLineLike}

    public AnchorFunctions = {
        "here": {
            get: this.getNear.bind(this),
            set: this.setNear.bind(this)
        },
        "centre": {
            get: this.getCentre.bind(this),
            set: this.setCentre.bind(this),
        },
        "far": {
            get: this.getFar.bind(this),
            set: this.setFar.bind(this)
        }
    }

    adjustment: [number, number];
    orientation: Orientation;
    
    private _x2?: number;
    private _y2?: number;
    
    
    constructor(params: RecursivePartial<ILineLike>, templateName: string="default") {
        var fullParams: ILineLike = FillObject<ILineLike>(params, LineLike.defaults[templateName]);
        super(fullParams);
        this.ref = "LINE"

        this.adjustment = fullParams.adjustment;
        this.orientation = fullParams.orientation;

        this.sizeSource.x = "inherited"; this.sizeSource.y = "inherited"
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
        if (this._x2 !== undefined) {
            return this._x2;
        }
        throw new Error("x2 unset");
    }
    public set x2(v : number) {
        this._x2 = v;
    }
    public get y2() : number {
        if (this._y2 !== undefined) {
            return this._y2;
        }
        throw new Error("y2 unset");
    }
    public set y2(v : number) {
        this._y2 = v;
    }

    // Anchors:
    public override getNear(dimension: Dimensions, ofContent: boolean=false): number | undefined {
        switch (dimension) {
            case "x":
                if (this._x === undefined) {return undefined}
                if (ofContent) { 
                    return this.contentX; 
                }
                return this._x;
            case "y":
                if (this._y === undefined) {return undefined}
                if (ofContent) { return this.contentY; }
                return this._y;
        }
    }
    public override setNear(dimension: Dimensions, v : number) {
        switch (dimension) {
            case "x":
                this.x = v;
                break;
            case "y":
                this.y = v;
                break;
        }
    }
    public override getCentre(dimension: Dimensions, ofContent: boolean=false): number | undefined {
        switch (dimension) {
            case "x":
                if (this._x === undefined) {return undefined}
                if (ofContent) { return this.contentX + (this.contentWidth ? posPrecision(this.contentWidth/2) : 0); }
                return this.x + posPrecision(this.width/2);
            case "y":
                if (this._y === undefined) {return undefined}
                if (ofContent) { return this.contentY + (this.contentHeight ? posPrecision(this.contentHeight/2) : 0); }
                return this.y + posPrecision(this.height/2);
        }
    }
    public override setCentre(dimension: Dimensions, v : number) {
        switch (dimension) {
            case "x":
                this.x = v - this.width/2;
                break;
            case "y":
                this.y = v - this.height/2;
                break;
        }
    }
    public override getFar(dimension: Dimensions, ofContent: boolean=false): number | undefined {
        switch (dimension) {
            case "x":
                if (this._x2 === undefined) {return undefined}
                // if (ofContent) { return this.contentX + (this.contentWidth ? this.contentWidth : 0); }
                return this.x2;
            case "y":
                if (this._y2 === undefined) {return undefined}
                // if (ofContent) { return this.contentY + (this.contentHeight ? this.contentHeight : 0); }
                return this.y2;
        }
    }
    public override setFar(dimension: Dimensions, v : number) {
        switch (dimension) {
            case "x":
                this.x2 = v;
                break;
            case "y":
                this.y2 = v;
                break;
        }
    }
}