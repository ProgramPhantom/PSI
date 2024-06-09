import Point, { BinderGetFunction, BinderSetFunction, BindingRule, IPoint } from "./point";

export interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number
}

export interface Size {
    width?: number,
    height?: number
}

export enum Dimensions {X="x", Y="y"}

export interface ISpacial extends IPoint {
    width?: number,
    height?: number,
}

export default class Spacial extends Point {
    AnchorFunctions = {
        "here": {
            // Anchors:
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



    protected _contentWidth?: number;
    protected _contentHeight?: number;

    refName: string;

    constructor(x?: number, y?: number, width?: number, height?: number, refName: string="spacial") {
        super(x, y);

        this.refName = refName;
        
        width !== undefined ? this._contentWidth = width : null;
        height !== undefined ? this._contentHeight = height : null;
    }

    get contentWidth() : number | undefined {
        return this._contentWidth;
    }
    set contentWidth(v : number | undefined) {
        if (v !== this._contentWidth) {
            this._contentWidth = v;
            this.enforceBinding();
        }
    }

    get contentHeight() : number | undefined {
        return this._contentHeight;
    }
    set contentHeight(v : number | undefined) {
        if (v !== this.contentHeight) {
            this._contentHeight = v;
            this.enforceBinding();
        }
    }

    get contentBounds(): Bounds {
        var top = this.y;
        var left = this.x;

        var bottom = this.y + (this.contentHeight ? this.contentHeight : 0);
        var right = this.x + (this.contentWidth ? this.contentWidth : 0);

        return {top: top, right: right, bottom: bottom, left: left}
    }

    set contentDim(b: Size)  {
        this._contentWidth = b.width;
        this._contentHeight = b.height;
    }
    get contentDim(): Size {
        return {width: this.contentWidth, height: this.contentWidth};

        throw new Error("dimensions unset");
    }

    get width(): number {
        if (this.contentWidth !== undefined) {
            return this.contentWidth;
        }
        throw new Error("Width unset")
    }
    get height(): number {
        if (this.contentHeight !== undefined) {
            return this.contentHeight;
        }
        throw new Error("Dimensions undefined")
    }

    bind(el: Point, dimension: Dimensions, anchorBindSide: keyof (typeof this.AnchorFunctions), targetBindSide: keyof (typeof this.AnchorFunctions), offset?: number) {
        var found = false;

        // var anchorGetter: BinderGetFunction = this.AnchorFunctions[anchorBindSide].get;
        // var targetSetter: BinderSetFunction = el.AnchorFunctions[targetBindSide].set;

        this.bindings.forEach((b) => {
            if (b.targetObject === el && b.bindingRule.dimension === dimension) {
                found = true;
                
                console.warn("Warning: overriding binding");
                
                b.bindingRule.anchorSiteName = anchorBindSide;
                b.bindingRule.targetSiteName = targetBindSide;
                b.bindingRule.dimension = dimension;
                b.offset = offset;
        }})


        if (!found) {
            var newBindingRule: BindingRule = {
                anchorSiteName: anchorBindSide,
                targetSiteName: targetBindSide,
                dimension: dimension,
            };

        
            this.bindings.push({targetObject: el, bindingRule: newBindingRule, offset: offset})
        }
    }


    // Anchors:
    public getNear(dimension: Dimensions): number {
        switch (dimension) {
            case Dimensions.X:
                return this.x;
            case Dimensions.Y:
                return this.y;
        }
    }
    public setNear(dimension: Dimensions, v : number) {
        switch (dimension) {
            case Dimensions.X:
                this.x = v;
                break;
            case Dimensions.Y:
                this.y = v;
                break;
        }
    }

    public getCentre(dimension: Dimensions): number {
        switch (dimension) {
            case Dimensions.X:
                return this.x + this.width/2;
            case Dimensions.Y:
                return this.y + this.height/2;
        }
    }
    public setCentre(dimension: Dimensions, v : number) {
        switch (dimension) {
            case Dimensions.X:
                this.x = v - this.contentWidth!/2;
                break;
            case Dimensions.Y:
                this.y = v - this.height/2;
                break;
        }
    }

    public getFar(dimension: Dimensions): number {
        switch (dimension) {
            case Dimensions.X:
                return this.x + this.width;
            case Dimensions.Y:
                return this.y + this.height;
        }
    }
    public setFar(dimension: Dimensions, v : number) {
        switch (dimension) {
            case Dimensions.X:
                this.x = v - this.width;
                break;
            case Dimensions.Y:
                this.y = v - this.height;
                break;
        }
    }

    // Helpers:
    get hasDimensions(): boolean {
        if (this.contentDim.height === undefined || !this.contentDim.height === undefined) {
            return false;
        } else {
            return true;
        }
    }
}