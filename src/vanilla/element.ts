import { SVG, Element as SVGElement, Svg, off } from '@svgdotjs/svg.js'
import SVGPulse from './pulses/image/svgPulse'
import Point, { PointBindSites, PointBindingRule } from './point'

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

export enum Dimension {
    X="x",
    Y="y"
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number
}

export enum ElementBindOptions {
    Here="here",
    Centre="centre",
    Far="far"
}

interface ElementBindingRule extends PointBindingRule {
    anchorSite: ElementBindOptions,
    targetSite: ElementBindOptions,

    dimension: Dimension,
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
    bindingRule: ElementBindingRule,
    targetElement: Element,
}


export abstract class Element extends Point {
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

    protected _contentDim: Dim = {};

    offset: number[];


    bindings: Binding[] = [];

    id: string;
    dirty: boolean = true;

    constructor(offset: Offset=[0, 0], x?: number, y?: number, dim?: Dim) {
        super(x, y);  // Will make dirty??

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

    bind(el: Point, dimension: Dimension, anchorBindSide: ElementBindOptions, targetBindSide: ElementBindOptions) {
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
            var newBindingRule: ElementBindingRule = {
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
                var anchorSide: ElementBindOptions = binding.bindingRule.anchorSite;
                var targetSide: ElementBindOptions = binding.bindingRule.targetSite;
                var dimension: Dimension = binding.bindingRule.dimension;

                var targetElement: Element = binding.targetElement;

                // get the X coord of the location on the anchor
                var anchorBindCoord: number = this.AnchorPointGetters[anchorSide](dimension);

                // Use the correct setter on the target with this value
                targetElement.AnchorSetters[targetSide](dimension, anchorBindCoord);
            }
        )
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