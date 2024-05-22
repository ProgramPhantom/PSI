import { SVG, Element as SVGElement, Svg, off } from '@svgdotjs/svg.js'
import SVGPulse from './pulses/image/svgPulse'

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

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number
}

enum BindingLocation {
    // Outer
    OuterTopLeft="outer-top-left",
    OuterTopCentre="outer-top-centre",
    OuterTopRight="outer-top-right",

    OuterCentreLeft="outer-centre-left",
    OuterCentreRight="outer-centre-right",

    OuterBottomLeft="outer-bottom-left",
    OuterBottomCentre="outer-bottom-centre",
    OuterBottomRight="outer-bottom-right",

    // Inner
    InnerTopLeft="inner-top-left",
    InnerTopCentre="inner-top-centre",
    InnerTopRight="inner-top-right",

    InnerCentreLeft="inner-centre-left",
    Centre="centre",
    InnerCentreRight="inner-centre-right",

    InnerBottomLeft="inner-bottom-left",
    InnerBottomCentre="inner-bottom-centre",
    InnerBottomRight="inner-bottom-right",
}

enum TestBindingLocation {
    Near="near",
    Centre="centre",
    Far="far"
}

export enum Dimension {
    X="x",
    Y="y"
}

interface BindingRules {
    anchorHorizontal?: TestBindingLocation,
    targetHorizontal?: TestBindingLocation,


    anchorVertical?: TestBindingLocation,
    targetVertical?: TestBindingLocation
}

type Padding = number | [number, number] | [number, number, number, number]
type Offset = [number, number]

export interface IDraw {
    draw(surface: Svg): void
}

export interface IElement {
    padding: [number, number, number, number],
    offset: [number, number],
}

interface Binding {
    bindingRules: BindingRules,
    targetElement: Element,
}


export abstract class Element {
    public AnchorSetters: {[name: string]: (dimension: Dimension, v : number) => void} = {
        "near": this.setNear,
        "centre": this.setCentre,
        "far": this.setFar
    }
    public AnchorPointGetters: {[name: string]: (dimension: Dimension) => number} = {
        "near": this.getNear,
        "centre": this.getCentre,
        "far": this.getCentre
    }

    private _x?: number;
    private _y?: number;
    protected _contentDim: Dim = {};

    offset: number[];

    bindings: Binding[] = [];

    id: string;
    dirty: boolean = true;

    constructor(offset: Offset=[0, 0], x?: number, y?: number, dim?: Dim) {
        this._x = x;
        this._y = y;  // Will make dirty??

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

    bind(el: Element, coordinate: Dimension, anchorBindLocation: TestBindingLocation, targetBindLocation: TestBindingLocation) {
        var found = false;
        this.bindings.forEach((b) => {
            if (b.targetElement === el) {
                found = true;

                switch (coordinate) {
                    case Dimension.X:
                        b.bindingRules.anchorHorizontal = anchorBindLocation;
                        b.bindingRules.targetHorizontal = targetBindLocation;
                        break;
                    case Dimension.Y:
                        b.bindingRules.anchorVertical = anchorBindLocation;
                        b.bindingRules.targetVertical = targetBindLocation;
                        break;
                }
            }
        })

        if (!found) {
            var newBindingRules: BindingRules = {};

            switch (coordinate) {
                case Dimension.X:
                    newBindingRules.anchorHorizontal = anchorBindLocation;
                    newBindingRules.targetHorizontal = targetBindLocation;
                    break;
                case Dimension.Y:
                    newBindingRules.anchorVertical = anchorBindLocation;
                    newBindingRules.targetVertical = targetBindLocation;
                    break;
            }

            this.bindings.push({targetElement: el, bindingRules: newBindingRules})
        }
    }

    // TODO: implement targetAnchor
    private enforceBinding() {
        this.bindings.forEach((binding) => {
                binding.targetElement.dirty = true;
                var rules: BindingRules = binding.bindingRules;
                var target: Element = binding.targetElement;

                if (rules.anchorHorizontal && rules.targetHorizontal) {  // We have a horizontal binding
                    // get the X coord of the location on the anchor
                    var anchorBindLocation: number = this.AnchorPointGetters[rules.anchorHorizontal](Dimension.X);

                    // Use the correct setter on the target with this value
                    target.AnchorSetters[rules.targetHorizontal](Dimension.X, anchorBindLocation)
                }

                if (rules.anchorVertical && rules.targetVertical) {  // We have a horizontal binding
                    // get the Y coord of the location on the anchor
                    var anchorBindLocation: number = this.AnchorPointGetters[rules.anchorVertical](Dimension.Y);

                    // Use the correct setter on the target with this value
                    target.AnchorSetters[rules.targetVertical](Dimension.Y, anchorBindLocation)
                }
            }
        )
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
    private set x(val: number) {
        this.dirty = true;
        this._x = val;
    }
    private set y(val: number) {
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

    // Top (y)
    public get tL() : [number, number] {
        return [this.x, this.y];
    }
    public set tL(xy : [number, number]) {
        this.x = xy[0];
        this.y = xy[1];
    }

    public get tC() : [number, number] {
        return [this.x + this.width/2, this.y];
    }
    public set tC(xy : [number, number]) {
        this.x = xy[0] - this.width/2;
        this.y = xy[1];
    }

    public get tR() : [number, number] {
        return [this.x + this.width, this.y];
    }
    public set tR(xy : [number, number]) {
        this.x = xy[0] - this.width;
        this.y = xy[1];
    }

    // Centre (y)
    public get cL() : [number, number] {
        return [this.x, this.y + this.height/2];
    }
    public set cL(xy : [number, number]) {
        this.x = xy[0];
        this.y = xy[1] - this.height/2;
    }

    public get centre() : [number, number] {
        return [this.x + this.width/2, this.y + this.height/2];
    }
    public set centre(xy : [number, number]) {
        this.x = xy[0] - this.width/2;
        this.y = xy[1] - this.height/2;
    }

    public get cR() : [number, number] {
        return [this.x + this.width, this.y + this.height/2];
    }
    public set cR(xy : [number, number]) {
        this.x = xy[0] - this.width;
        this.y = xy[1] - this.height/2;
    }

    // Bottom (y)
    public get bL() : [number, number] {
        return [this.x, this.y + this.height];
    }
    public set bL(xy : [number, number]) {
        this.x = xy[0];
        this.y = xy[1] - this.height;
    }

    public get bC() : [number, number] {
        return [this.x + this.width/2, this.y + this.height];
    }
    public set bC(xy : [number, number]) {
        this.x = xy[0] - this.width/2;
        this.y = xy[1] - this.height;
    }

    public get bR() : [number, number] {
        return [this.x + this.width, this.y + this.height];
    }
    public set bR(xy : [number, number]) {
        this.x = xy[0] - this.width;
        this.y = xy[1] - this.height;
    }


    
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