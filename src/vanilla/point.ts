interface Shift {
    dx?: number,
    dy?: number,
}

export interface Place {
    x?: number,
    y?: number
}

export enum Dimension {
    X="x",
    Y="y"
}

export type BinderSetFunction = (dimension: Dimension, v: number) => void;
export type BinderGetFunction = (dimension: Dimension) => number;

export interface BindingRule {
    anchorSiteGetter: BinderGetFunction,
    targetSiteSetter: BinderSetFunction,

    dimension: Dimension,
}

export interface Binding {
    bindingRule: BindingRule,
    targetObject: Point,
    offset?: number
}


export default class Point {
    AnchorFunctions = {
        "here": {
            // Anchors:
            get: this.getNear,
            set: this.setNear
        }
    }

    protected _x?: number;
    protected _y?: number;

    bindings: Binding[] = [];

    constructor(x?: number, y?: number) {
        this.x = x;
        this.y = y;
    }

    get x(): number {
        if (this._x) {
            return this._x;
        }
        throw new Error("x unset");
    }
    get y(): number {
        if (this._y) {
            return this._y;
        }
        throw new Error("y unset");
    }
    protected set x(val: number | undefined) {
        this._x = val;
    }
    protected set y(val: number | undefined) {
        this._y = val;
    }


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

    bind(el: Point, dimension: Dimension, anchorBindSide: keyof (typeof this.AnchorFunctions), targetBindSetter: BinderSetFunction, offset?: number) {
        var found = false;

        var anchorGetter: BinderGetFunction = this.AnchorFunctions[anchorBindSide].get;

        this.bindings.forEach((b) => {
            if (b.targetObject === el) {
                found = true;
                
                console.warn("Warning: overriding binding");
                
                b.bindingRule.anchorSiteGetter = anchorGetter;
                b.bindingRule.targetSiteSetter = targetBindSetter;
                b.bindingRule.dimension = dimension;
                b.offset = offset;
        }})


        if (!found) {
            var newBindingRule: BindingRule = {
                anchorSiteGetter: anchorGetter,
                targetSiteSetter: targetBindSetter,
                dimension: dimension,
            };

        
            this.bindings.push({targetObject: el, bindingRule: newBindingRule, offset: offset})
        }
    }

    protected enforceBinding() {
        this.bindings.forEach((binding) => {
                var getter: BinderGetFunction = binding.bindingRule.anchorSiteGetter;
                var setter: BinderSetFunction = binding.bindingRule.targetSiteSetter;
                var dimension: Dimension = binding.bindingRule.dimension;

                var targetElement: Point = binding.targetObject;

                // get the X coord of the location on the anchor
                var anchorBindCoord: number = getter(dimension);

                // Apply offset:
                anchorBindCoord = anchorBindCoord + (binding.offset ? binding.offset : 0);

                // Use the correct setter on the target with this value
                setter(dimension, anchorBindCoord);
            }
        )
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
}