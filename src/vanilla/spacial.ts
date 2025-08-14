import { Svg, Element } from "@svgdotjs/svg.js";
import Point, { IPoint } from "./point";
import { SVG } from "@svgdotjs/svg.js";
import logger, { Operations } from "./log";
import { posPrecision } from "./util";

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

export type BinderSetFunction = (dimension: Dimensions, v: number) => void;
export type BinderGetFunction = (dimension: Dimensions, onContent?: boolean) => number | undefined;

export interface BindingRule {
    anchorSiteGetter?: BinderGetFunction,
    targetSiteSetter?: BinderSetFunction,

    anchorSiteName: string,
    targetSiteName: string,

    dimension: Dimensions,
}

export interface Binding {
    bindingRule: BindingRule,
    targetObject: Spacial,
    offset?: number,
    bindToContent: boolean,
    hint?: string
}

export enum Dimensions {X="x", Y="y"}


export interface SizeBinding {
    dimension: Dimensions,
    target: Spacial
}

export interface ISpacial extends IPoint {
    contentWidth?: number,
    contentHeight?: number,
}

export type UpdateNotification = (...args: any[]) => any


export default class Spacial extends Point implements ISpacial {
    static override defaults: {[name: string]: ISpacial} = {
        "default": {
            x: undefined,
            y: undefined,
            contentWidth: 0,
            contentHeight: 0,
            ref: "default-spacial"
        },
    }

    get state(): ISpacial {
        return {
            x: this._x,
            y: this._y,
            contentWidth: this._contentWidth,
            contentHeight: this._contentHeight,
            ref: this.ref
    }}

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
    protected _contentWidth?: number;
    protected _contentHeight?: number;
    
    sizeBindings: SizeBinding[] = [];
    bindings: Binding[] = [];

    constructor(x?: number, y?: number, width?: number, height?: number, ref: string="spacial") {
        super(x, y, ref);
        
        width !== undefined ? this._contentWidth = width : null;
        height !== undefined ? this._contentHeight = height : null;
    }

    public get contentX() : number {
        return this.x;
    }
    public set contentX(v : number) {
        throw new Error("not implemented")
        // this._contentX = v;
    }

    public get contentY() : number {
        return this.y;
    }
    public set contentY(v : number) {
        throw new Error("not implemented")
        // this._contentY = v;
    }

    get contentWidth() : number | undefined {
        return this._contentWidth;
    }
    set contentWidth(v : number | undefined) {
        if (v !== this._contentWidth) {
            this._contentWidth = v;
            this.enforceBinding();
            this.enforceSizeBinding();
        }
    }

    get contentHeight() : number | undefined {
        return this._contentHeight;
    }
    set contentHeight(v : number | undefined) {
        if (v !== this.contentHeight) {
            this._contentHeight = v;
            this.enforceBinding();
            this.enforceSizeBinding();
        }
    }

    get contentBounds(): Bounds {
        var top = this.contentY;
        var left = this.contentX;

        var bottom = this.contentY + (this.contentHeight ? this.contentHeight : 0);
        var right = this.contentX + (this.contentWidth ? this.contentWidth : 0);

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

    public stretchy: boolean = false;

    public clearBindings(dimension: Dimensions) {
        this.bindings = this.bindings.filter(b => b.bindingRule.dimension !== dimension);
    }

    bind(target: Spacial, dimension: Dimensions, anchorBindSide: keyof (typeof this.AnchorFunctions), 
         targetBindSide: keyof (typeof this.AnchorFunctions), offset?: number, hint: string="binding", bindToContent: boolean=true, ) {
        
        var found = false;

        if (hint === "binding") {
            
        }

        this.bindings.forEach((b) => {
            if (b.targetObject === target && b.bindingRule.dimension === dimension) {
                found = true;
                
                if (b.targetObject.stretchy === false) {
                    // Not stretchy so this gets overridden
                    console.warn(`Warning: overriding binding on dimension ${b.bindingRule.dimension} for anchor ${this.ref} to target ${target.ref}`);
                    
                    b.bindingRule.anchorSiteName = anchorBindSide;
                    b.bindingRule.targetSiteName = targetBindSide;
                    b.bindingRule.dimension = dimension;
                    b.bindToContent = bindToContent;
                    b.offset = offset;
                } else {  // Stretchy === true
                    var newBindingRule: BindingRule = {
                        anchorSiteName: anchorBindSide,
                        targetSiteName: targetBindSide,
                        dimension: dimension,
                    };

                
                    this.bindings.push({targetObject: target, bindingRule: newBindingRule, offset: offset, bindToContent: bindToContent, hint: hint})
                }
        }})


        if (!found) {
            var newBindingRule: BindingRule = {
                anchorSiteName: anchorBindSide,
                targetSiteName: targetBindSide,
                dimension: dimension,
            };

        
            this.bindings.push({targetObject: target, bindingRule: newBindingRule, offset: offset, bindToContent: bindToContent, hint: hint})
        }
    }

    public enforceBinding() {
        this.bindings.map((b) => b.targetObject).forEach((e) => {
            e.displaced = true;
        })

        if (this.ref === "default-label") {
            console.log()
        }

        for (const binding of this.bindings) {
            var targetElement: Spacial = binding.targetObject;
            var getter: BinderGetFunction = this.AnchorFunctions[binding.bindingRule.anchorSiteName as keyof typeof this.AnchorFunctions].get;
            var setter: BinderSetFunction = targetElement.AnchorFunctions[binding.bindingRule.targetSiteName as keyof typeof targetElement.AnchorFunctions].set;
            var targetPosChecker: BinderGetFunction = targetElement.AnchorFunctions[binding.bindingRule.targetSiteName as keyof typeof targetElement.AnchorFunctions].get
            var dimension: Dimensions = binding.bindingRule.dimension;

            
            // get the X coord of the location on the anchor
            var anchorBindCoord: number | undefined = getter(dimension, binding.bindToContent);

            if (anchorBindCoord === undefined) {
                continue
            }

            // Apply offset:
            anchorBindCoord = anchorBindCoord + (binding.offset ? binding.offset : 0);
            
            // Current position of target:
            var currentTargetPointPosition: number | undefined = targetPosChecker(dimension, binding.bindToContent);
            
            // This must happen BEFORE the element is positioned so the last element moved in the collection 
            // triggers the compute boundary
            targetElement.displaced = false;

            // Only go into the setter if it will change a value, massively reduces function calls.
            // Alternative was doing the check inside the setter which still works but requires a function call
            if (anchorBindCoord !== currentTargetPointPosition) {
                // Use the correct setter on the target with this value
                logger.operation(Operations.BIND, `(${this.ref})[${anchorBindCoord}] ${dimension}> (${targetElement.ref})[${currentTargetPointPosition}]`, this);
                

                setter(dimension, anchorBindCoord!);  // SETTER MAY NEED INTERNAL BINDING FLAG?
            }
        }
    }
    

    bindSize(el: Spacial, dimension: Dimensions) {
        var found = this.sizeBindings.map(b => b.target).indexOf(el)
        if (found !== -1) {
            console.warn("Warning: overriding binding");
            var rule = this.sizeBindings[found]
            
            rule.dimension = dimension;
            rule.target = el;
        } else {
            this.sizeBindings.push({target: el, dimension: dimension})
        }
    }

    removeBind(el: Point, dimension?: Dimensions) {
        // Remove all bindings associated with el
        // this.bindings.forEach((b, i) => {
        //     if (b.targetObject === el) {
        //         this.bindings.splice(i, 1);
        //     }
        // })
        this.bindings = this.bindings.filter(function(binding) {
            if (binding.targetObject == el) {
                if (dimension !== undefined) {
                    if (binding.bindingRule.dimension === dimension) {
                        return false
                    } else {
                        return true
                    }
                } else {
                    return false;
                }
            } else {
                return true;
            }
            
        });
    }

    enforceSizeBinding() {
        this.sizeBindings.forEach((b) => {
            switch (b.dimension) {
                case Dimensions.X:
                    b.target.contentWidth = this.contentWidth;
                    break;
                case Dimensions.Y:
                    b.target.contentHeight = this.contentHeight;
                    break;
            }
        })
    }

    subscribers: UpdateNotification[] = [];

    subscribe(toRun: UpdateNotification) {
        if (this.ref === "label") {
            
        }
        this.subscribers.push(toRun);
    }

    notifyChange() {
        this.subscribers?.forEach((s) => {
            logger.broadcast(this, s.name.split(" ")[1])
            s();
        })
    }

    // Anchors:
    public getNear(dimension: Dimensions, ofContent: boolean=false): number | undefined {
        switch (dimension) {
            case Dimensions.X:
                if (this._x === undefined) {return undefined}
                if (ofContent) { 
                    return this.contentX; 
                }
                return this._x;
            case Dimensions.Y:
                if (this._y === undefined) {return undefined}
                if (ofContent) { return this.contentY; }
                return this._y;
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

    public getCentre(dimension: Dimensions, ofContent: boolean=false): number | undefined {
        switch (dimension) {
            case Dimensions.X:
                if (this._x === undefined) {return undefined}
                if (ofContent) { return this.contentX + (this.contentWidth ? posPrecision(this.contentWidth/2) : 0); }
                return this.x + posPrecision(this.width/2);
            case Dimensions.Y:
                if (this._y === undefined) {return undefined}
                if (ofContent) { return this.contentY + (this.contentHeight ? posPrecision(this.contentHeight/2) : 0); }
                return this.y + posPrecision(this.height/2);
        }
    }
    public setCentre(dimension: Dimensions, v : number) {
        switch (dimension) {
            case Dimensions.X:
                this.x = v - this.width/2;
                break;
            case Dimensions.Y:
                this.y = v - this.height/2;
                break;
        }
    }

    public getFar(dimension: Dimensions, ofContent: boolean=false): number | undefined {
        switch (dimension) {
            case Dimensions.X:
                if (this._x === undefined) {return undefined}
                if (ofContent) { return this.contentX + (this.contentWidth ? this.contentWidth : 0); }
                return this.x + this.width;
            case Dimensions.Y:
                if (this._y === undefined) {return undefined}
                if (ofContent) { return this.contentY + (this.contentHeight ? this.contentHeight : 0); }
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
            this._x = val !== undefined ? posPrecision(val) : undefined;
            this.enforceBinding();
        }
    }
    protected set y(val: number | undefined) {
        if (val !== this._y) {
            this._y = val !== undefined ? posPrecision(val) : undefined;
            this.enforceBinding();
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

    get definedVertically(): boolean {
        if (this._y !== undefined && this.contentHeight !== undefined) {
            return true;
        }
        return false;
    }
    get definedHorizontally(): boolean {
        if (this._x !== undefined && this.contentWidth !== undefined) {
            return true;
        }
        return false;
    }

    get isResolved(): boolean {
        return this.definedHorizontally && this.definedVertically;
    }

    setSizeByDimension(v: number, dim: Dimensions) {
        switch (dim) {
            case Dimensions.X:
                this.contentWidth = v;
                break;
            case Dimensions.Y:
                this.contentHeight = v;
                break;
        }
    }

    getSizeByDimension(dim: Dimensions): number {
        switch (dim) {
            case Dimensions.X:
                return this.width;
            case Dimensions.Y:
                return this.height;
        }
    }
}