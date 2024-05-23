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

export class PointBindOptions {
    static HERE: string = "here";
}

type test = "here";
type test2 = test | "centre" | "far"

var t: test2 = "centre";

export interface PointBindingRule {
    anchorSite: test,
    targetSite: PointBindOptions,

    dimension: Dimension,
}

export default class Point {
    protected _x?: number;
    protected _y?: number;

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
    private set x(val: number | undefined) {
        this._x = val;
    }
    private set y(val: number | undefined) {
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

    bind(el: Point, dimension: Dimension, ...args: any[]) {
        var found = false;

        this.bindings.forEach((b) => {
            if (b.targetElement === el) {
                found = true;
                
                console.warn("Warning: overriding binding");
                
                b.bindingRule.anchorSite = anchorBindSide;
                b.bindingRule.targetSite = targetBindSide;
                b.bindingRule.dimension = dimension;
        }})


        if (!found) {
            var newBindingRule: PointBindingRule = {
                targetSite: targetBindSide,
                anchorSite: anchorBindSide,
                dimension: dimension,
            };

        
            this.bindings.push({targetElement: el, bindingRule: newBindingRule})
        }
    }

    private enforceBinding() {
        this.bindings.forEach((binding) => {
                binding.targetElement.dirty = true;
                var anchorSide: BindSite = binding.bindingRule.anchorSite;
                var targetSide: BindSite = binding.bindingRule.targetSite;
                var dimension: Dimension = binding.bindingRule.dimension;

                var targetElement: Element = binding.targetElement;

                // get the X coord of the location on the anchor
                var anchorBindCoord: number = this.AnchorPointGetters[anchorSide](dimension);

                // Use the correct setter on the target with this value
                targetElement.AnchorSetters[targetSide](dimension, anchorBindCoord);
            }
        )
    }
}