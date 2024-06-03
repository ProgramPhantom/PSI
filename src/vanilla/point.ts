import { Dimensions } from "./spacial";

interface Shift {
    dx?: number,
    dy?: number,
}

export interface Place {
    x?: number,
    y?: number
}

export type BinderSetFunction = (dimension: Dimensions, v: number) => void;
export type BinderGetFunction = (dimension: Dimensions) => number;

export interface BindingRule {
    anchorSiteGetter?: BinderGetFunction,
    targetSiteSetter?: BinderSetFunction,

    anchorSiteName: string,
    targetSiteName: string,

    dimension: Dimensions,
}

export interface Binding {
    bindingRule: BindingRule,
    targetObject: Point,
    offset?: number
}


export default class Point {
    AnchorFunctions;

    protected _x?: number;
    protected _y?: number;

    bindings: Binding[] = [];

    constructor(x?: number, y?: number) {
        this.x = x;
        this.y = y;

        this.AnchorFunctions = {
            "here": {
                // Anchors:
                get: this.getNear.bind(this),
                set: this.setNear.bind(this)
            }
        }
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
        this._x = val;
        this.enforceBinding();
    }
    protected set y(val: number | undefined) {
        this._y = val;
        this.enforceBinding();
    }


    move({dx, dy}: Shift) {
        this.x += dx ? dx : 0;
        this.y += dy ? dy : 0;

        this.enforceBinding();
    }
    place({x, y}: {x?: number, y?: number}) {
        x !== undefined ? this.x = x : {}
        y !== undefined ? this.y = y : {}

        this.enforceBinding();
    }

    bind(el: Point, dimension: Dimensions, anchorBindSide: keyof (typeof this.AnchorFunctions), targetBindSide: keyof (typeof el.AnchorFunctions), offset?: number) {
        var found = false;

        var anchorGetter: BinderGetFunction = this.AnchorFunctions[anchorBindSide].get;
        var targetSetter: BinderSetFunction = el.AnchorFunctions[targetBindSide].set;

        this.bindings.forEach((b) => {
            if (b.targetObject === el && b.bindingRule.dimension === dimension) {  // Don't override simply because same element, dimension could be different!
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

    public enforceBinding() {
        function bar(callbackFn: (this: void) => any, thisArg?: undefined): any;
        function bar<T>(callbackFn: (this: T) => any, thisArg: T): any;
        function bar<T, TResult>(callbackFn: (this: T) => TResult, thisArg: T): TResult {
            return callbackFn.call(thisArg);
        }

        for (const binding of this.bindings) {
            var targetElement: Point = binding.targetObject;
            var getter: BinderGetFunction = this.AnchorFunctions[binding.bindingRule.anchorSiteName as keyof typeof this.AnchorFunctions].get;
            var setter: BinderSetFunction = targetElement.AnchorFunctions[binding.bindingRule.targetSiteName as keyof typeof targetElement.AnchorFunctions].set;
            var dimension: Dimensions = binding.bindingRule.dimension;

            
            // get the X coord of the location on the anchor
            var anchorBindCoord: number = getter(dimension);

            // Apply offset:
            anchorBindCoord = anchorBindCoord + (binding.offset ? binding.offset : 0);

            // Use the correct setter on the target with this value
            setter(dimension, anchorBindCoord);
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

    // Helpers:
    get hasPosition(): boolean {
        if (!this._x || !this._y) {
            return false;
        } else {
            return true;
        }
    }
}