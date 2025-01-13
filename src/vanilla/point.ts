import Aligner from "./aligner";
import logger, { Operations } from "./log";
import Spacial, { Dimensions } from "./spacial";




interface Shift {
    dx?: number,
    dy?: number,
}

export interface Place {
    x?: number,
    y?: number
}

export type BinderSetFunction = (dimension: Dimensions, v: number) => void;
export type BinderGetFunction = (dimension: Dimensions, onContent?: boolean) => number;

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
    offset?: number,
    bindToContent: boolean,
    hint?: string
}



export interface IPoint {
    x?: number,
    y?: number
}


export default class Point implements IPoint {
    AnchorFunctions = {
        "here": {
            // Anchors:
            get: this.getNear.bind(this),
            set: this.setNear.bind(this)
        }
    };

    protected _x?: number;
    protected _y?: number;

    id: string;
    refName: string;

    bindings: Binding[] = [];

    displaced: boolean=false;

    constructor(x?: number, y?: number, refName: string = "point") {
        this.x = x;
        this.y = y;

        this.refName = refName;

        this.id = Math.random().toString(16).slice(2);
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
        if (val !== this._x) {
            this._x = val;
            this.enforceBinding();
        }
    }
    protected set y(val: number | undefined) {
        if (val !== this._y) {
            
            if (this.refName === "label column") {
                
            }
            
            

            this._y = val;
            this.enforceBinding();
        }
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

    bind(el: Point, dimension: Dimensions, anchorBindSide: keyof (typeof this.AnchorFunctions), targetBindSide: keyof (typeof el.AnchorFunctions), offset?: number, hint?: string) {
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

        
            this.bindings.push({targetObject: el, bindingRule: newBindingRule, offset: offset, bindToContent: false, hint: hint})
        }
    }

    removeBind(el: Point) {
        // Remove all bindings associated with el
        // this.bindings.forEach((b, i) => {
        //     if (b.targetObject === el) {
        //         this.bindings.splice(i, 1);
        //     }
        // })
        this.bindings = this.bindings.filter(b => b.targetObject !== el);
    }

    public enforceBinding() {
        this.bindings.map((b) => b.targetObject).forEach((e) => {
            e.displaced = true;
        })

        for (const binding of this.bindings) {
            var targetElement: Point = binding.targetObject;
            var getter: BinderGetFunction = this.AnchorFunctions[binding.bindingRule.anchorSiteName as keyof typeof this.AnchorFunctions].get;
            var setter: BinderSetFunction = targetElement.AnchorFunctions[binding.bindingRule.targetSiteName as keyof typeof targetElement.AnchorFunctions].set;
            var dimension: Dimensions = binding.bindingRule.dimension;

            
            // get the X coord of the location on the anchor
            var anchorBindCoord: number = getter(dimension, binding.bindToContent);

            // Apply offset:
            anchorBindCoord = anchorBindCoord + (binding.offset ? binding.offset : 0);
            
            // Current position of target:
            var currentPos: number | undefined = targetElement.getPositionByDimension(dimension);
            
            // Only go into the setter if it will change a value, massively reduces function calls.
            // Alternative was doing the check inside the setter which still works but requires a function call
            if (anchorBindCoord !== currentPos) {
                // Use the correct setter on the target with this value
                logger.operation(Operations.BIND, `(${this.refName})[${anchorBindCoord}] ${dimension}> (${targetElement.refName})[${currentPos}]`, this);
                setter(dimension, anchorBindCoord);  // SETTER MAY NEED INTERNAL BINDING FLAG?
            }
            
            targetElement.displaced = false;
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
        if (this._x === undefined || this._y === undefined) {
            return false;
        } else {
            return true;
        }
    }

    getSizeByDimension(dim: Dimensions): number {
        return 0;
    }

    getPositionByDimension(dim: Dimensions): number | undefined {
        if (dim === Dimensions.X) {
            return this._x;
        } else {
            return this._y;
        }
    }
}