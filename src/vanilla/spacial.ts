import { Svg, Element } from "@svgdotjs/svg.js";
import Point, { BinderGetFunction, BinderSetFunction, BindingRule, IPoint } from "./point";
import { SVG } from "@svgdotjs/svg.js";
import logger from "./log";

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
    get state(): ISpacial {
        return {
            x: this._x,
            y: this._y,
            contentWidth: this._contentWidth,
            contentHeight: this._contentHeight
    }}

    AnchorFunctions = {
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

    constructor(x?: number, y?: number, width?: number, height?: number, refName: string="spacial") {
        super(x, y, refName);

        this.refName = refName;
        
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

    public clearBindings(dimension: Dimensions) {
        this.bindings = this.bindings.filter(b => b.bindingRule.dimension !== dimension);
    }

    bind(target: Point, dimension: Dimensions, anchorBindSide: keyof (typeof this.AnchorFunctions), 
         targetBindSide: keyof (typeof this.AnchorFunctions), offset?: number, hint: string="binding", bindToContent: boolean=true, ) {
        
        var found = false;

        if (hint === "binding") {
            
        }

        // var anchorGetter: BinderGetFunction = this.AnchorFunctions[anchorBindSide].get;
        // var targetSetter: BinderSetFunction = el.AnchorFunctions[targetBindSide].set;

        this.bindings.forEach((b) => {
            if (b.targetObject === target && b.bindingRule.dimension === dimension) {
                found = true;
                
                console.warn(`Warning: overriding binding on dimension ${b.bindingRule.dimension} anchor ${this.refName}`);
                
                b.bindingRule.anchorSiteName = anchorBindSide;
                b.bindingRule.targetSiteName = targetBindSide;
                b.bindingRule.dimension = dimension;
                b.bindToContent = bindToContent;
                b.offset = offset;
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
        if (this.refName === "label") {
            
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
    public getNear(dimension: Dimensions, ofContent: boolean=false): number {
        switch (dimension) {
            case Dimensions.X:
                if (ofContent) { 
                    return this.contentX; 
                }
                return this.x;
            case Dimensions.Y:
                if (ofContent) { return this.contentY; }
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

    public getCentre(dimension: Dimensions, ofContent: boolean=false): number {
        switch (dimension) {
            case Dimensions.X:
                if (ofContent) { return this.contentX + (this.contentWidth ? this.contentWidth/2 : 0); }
                return this.x + this.width/2;
            case Dimensions.Y:
                if (ofContent) { return this.contentY + (this.contentHeight ? this.contentHeight/2 : 0); }
                return this.y + this.height/2;
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

    public getFar(dimension: Dimensions, ofContent: boolean=false): number {
        switch (dimension) {
            case Dimensions.X:
                if (ofContent) { return this.contentX + (this.contentWidth ? this.contentWidth : 0); }
                return this.x + this.width;
            case Dimensions.Y:
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

    override getSizeByDimension(dim: Dimensions): number {
        switch (dim) {
            case Dimensions.X:
                return this.width;
            case Dimensions.Y:
                return this.height;
        }
    }
}