import { SVG } from "@svgdotjs/svg.js";
import logger, { Operations } from "./log";
import Point, { ID, IPoint } from "./point";
import { posPrecision } from "./util";
import { Rect } from "@svgdotjs/svg.js";

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

export type PositionMethod = "controlled" | "free" | "partially-controlled"
export type SizeMethod = "given" | "inherited"

export type SiteNames = "here" | "centre" | "far"

export type BinderSetFunction = (dimension: Dimensions, v: number) => void;
export type BinderGetFunction = (dimension: Dimensions, onContent?: boolean) => number | undefined;

export interface IBindingRule {
    anchorSiteGetter?: BinderGetFunction,
    targetSiteSetter?: BinderSetFunction,

    anchorSiteName: SiteNames,
    targetSiteName: SiteNames,

    dimension: Dimensions,
}

export interface IBinding {
    bindingRule: IBindingRule,
    targetObject: Spacial,
    anchorObject: Spacial,
    offset?: number,
    bindToContent: boolean,
    hint?: string
}

export interface IBindingPayload {
    anchorObject: Spacial,
    bindingRule: IBindingRule
}

export type Dimensions = "x" | "y"

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
            contentWidth: this._contentWidth,
            contentHeight: this._contentHeight,
            
            ...super.state
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
    
    override bindings: IBinding[] = [];
    override bindingsToThis: IBinding[] = [];

    constructor(x?: number, y?: number, width?: number, height?: number, ref: string="spacial", id: ID|undefined=undefined) {
        super(x, y, ref, id);
        
        width !== undefined ? this._contentWidth = width : null;
        height !== undefined ? this._contentHeight = height : null;
    }


    public getHitbox(): Rect {
        var hitbox = SVG().rect().id(this.id + "-hitbox").attr({"data-editor": "hitbox", key: this.ref});

        hitbox.size(this.width, this.height);
        hitbox.move(this.x, this.y);
        hitbox.fill(`transparent`).opacity(0.3);
        return hitbox;
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

    // ----------- Size --------------
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

    get width(): number {
        if (this.contentWidth !== undefined) {
            return this.contentWidth;
        }
        throw new Error("Width unset")
    }
    set width(v: number | undefined) {
        if (v === undefined) {
            this.contentWidth = undefined
        } else {
            var newContentWidth: number = v;

            this.contentWidth = newContentWidth;
        }
    }
    get height(): number {
        if (this.contentHeight !== undefined) {
            return this.contentHeight;
        }
        throw new Error("Dimensions undefined")
    }
    set height(v: number | undefined) {
        if (v === undefined) {
            this.contentHeight = undefined
        } else {
            var newContentHeight: number = v;

            this.contentHeight = newContentHeight;
        }
    }

    public sizeSource: Record<Dimensions, SizeMethod> = {"x": "given", "y": "given"};

    public clearBindings(dimension: Dimensions) {
        var toRemove: IBinding[] = [];
        for (var bind of this.bindings) {
            if (bind.bindingRule.dimension === dimension) {
                toRemove.push(bind);
                bind.targetObject.bindingsToThis = bind.targetObject.bindingsToThis.filter(b => b !== bind)
            }
        }

        this.bindings = this.bindings.filter(b => !toRemove.includes(b))

    }

    public clearBindsTo(target: Spacial, dimension?: Dimensions) {
        var toRemove: IBinding[] = [];
        for (var bind of this.bindings) {
            if (bind.targetObject === target && ((bind.bindingRule.dimension === dimension) || dimension === undefined)) {
                toRemove.push(bind);
                console.warn(`Removing binding ${bind.hint}`)
            }
        }
        
        this.bindings = this.bindings.filter(b => !toRemove.includes(b));
        target.bindingsToThis = target.bindingsToThis.filter(b => !toRemove.includes(b))
    }

    bind(target: Spacial, dimension: Dimensions, anchorBindSide: keyof (typeof this.AnchorFunctions), 
         targetBindSide: keyof (typeof this.AnchorFunctions), offset?: number, hint?: string, bindToContent: boolean=true, ) {
        
        if (hint === undefined) {
            hint = `'${this.ref}' [${anchorBindSide}] ${dimension}> '${target.ref}' [${targetBindSide}]`
        }

        var found = false;
        this.bindings.forEach((b) => {
            if (b.targetObject === target && b.bindingRule.dimension === dimension) {
                found = true;
                
                if (b.targetObject.sizeSource[dimension] === "given") {
                    // Not stretchy so this gets overridden
                    console.warn(`Warning: overriding binding on dimension ${b.bindingRule.dimension} for anchor ${this.ref} to target ${target.ref}`);
                    
                    b.bindingRule.anchorSiteName = anchorBindSide;
                    b.bindingRule.targetSiteName = targetBindSide;
                    b.bindingRule.dimension = dimension;
                    b.bindToContent = bindToContent;
                    b.offset = offset;
                } else {  // Stretchy === true
                    var newBindingRule: IBindingRule = {
                        anchorSiteName: anchorBindSide,
                        targetSiteName: targetBindSide,
                        dimension: dimension,
                    };
                    hint += " (stretch)";

                    var newBinding: IBinding = {targetObject: target, anchorObject: this, 
                        bindingRule: newBindingRule, offset: offset, bindToContent: bindToContent, hint: hint}
                    this.bindings.push(newBinding);
                    target.bindingsToThis.push(newBinding);
                }
        }})


        if (!found) {
            var newBindingRule: IBindingRule = {
                anchorSiteName: anchorBindSide,
                targetSiteName: targetBindSide,
                dimension: dimension,
            };

            var newBinding: IBinding = {targetObject: target, anchorObject: this, 
                bindingRule: newBindingRule, offset: offset, bindToContent: bindToContent, hint: hint}

            this.bindings.push(newBinding);
            target.bindingsToThis.push(newBinding);
        }
    }

    getCoordinateFromBindRule(binding: IBindingRule): number {
        var getter: BinderGetFunction = this.AnchorFunctions[binding.anchorSiteName as keyof typeof this.AnchorFunctions].get;

        return getter(binding.dimension)
    }

    public enforceBinding() {
        this.bindings.map((b) => b.targetObject).forEach((e) => {
            e.displaced = true;
        })



        for (const binding of this.bindings) {
            var targetElement: Spacial = binding.targetObject;
            var getter: BinderGetFunction = this.AnchorFunctions[binding.bindingRule.anchorSiteName as keyof typeof this.AnchorFunctions].get;
            var setter: BinderSetFunction = targetElement.AnchorFunctions[binding.bindingRule.targetSiteName as keyof typeof targetElement.AnchorFunctions].set;
            var targetPosChecker: BinderGetFunction = targetElement.AnchorFunctions[binding.bindingRule.targetSiteName as keyof typeof targetElement.AnchorFunctions].get
            var dimension: Dimensions = binding.bindingRule.dimension;

            if (binding.hint === "'acquire' [far] x> 'default-label' [far] (stretch)") {
                console.log()
            }
            
            // get the X coord of the location on the anchor
            var anchorBindCoord: number | undefined = getter(dimension, binding.bindToContent);

            if (anchorBindCoord === undefined) {
                continue
            }

            // Apply offset:
            anchorBindCoord = anchorBindCoord + (binding.offset ?? 0);
            
            // Current position of target:
            var currentTargetPointPosition: number | undefined = targetPosChecker(dimension, binding.bindToContent);
            
            // This must happen BEFORE the element is positioned so the last element moved in the collection 
            // triggers the compute boundary
            targetElement.displaced = false;

            // Only go into the setter if it will change a value, massively reduces function calls.
            // Alternative was doing the check inside the setter which still works but requires a function call
            if (anchorBindCoord !== currentTargetPointPosition) {
                // Use the correct setter on the target with this value
                logger.operation(Operations.BIND, 
                `(${this.ref})[${anchorBindCoord}, ${binding.bindingRule.anchorSiteName}] ${dimension}> (${targetElement.ref})[${currentTargetPointPosition}, ${binding.bindingRule.targetSiteName}]`, this);
                

                setter(dimension, anchorBindCoord!);  // SETTER MAY NEED INTERNAL BINDING FLAG?
            }
        }
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
    public setNear(dimension: Dimensions, v : number) {
        switch (dimension) {
            case "x":
                this.x = v;
                break;
            case "y":
                this.y = v;
                break;
        }
    }

    public getCentre(dimension: Dimensions, ofContent: boolean=false): number | undefined {
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
    public setCentre(dimension: Dimensions, v : number) {
        switch (dimension) {
            case "x":
                this.x = v - this.width/2;
                break;
            case "y":
                this.y = v - this.height/2;
                break;
        }
    }

    public getFar(dimension: Dimensions, ofContent: boolean=false): number | undefined {
        switch (dimension) {
            case "x":
                if (this._x === undefined) {return undefined}
                if (ofContent) { return this.contentX + (this.contentWidth ? this.contentWidth : 0); }
                return this.x2;
            case "y":
                if (this._y === undefined) {return undefined}
                if (ofContent) { return this.contentY + (this.contentHeight ? this.contentHeight : 0); }
                return this.y2;
        }
    }
    public setFar(dimension: Dimensions, v : number, stretch?: boolean) {
        switch (dimension) {
            case "x":
                if (this.sizeSource.x === "inherited" || stretch) {
                    if (this._x === undefined) {
                        throw new Error(`Trying to stretch element ${this.ref} with unset position`)
                    }
    
                    var diff: number = v - this.x;
                    if (diff < 0) {
                        throw new Error(`Flipped element ${this.ref}`)
                    }
                    if (diff === 0) {
                        return
                    }

                    this.width = diff
                } else {
                    this.x2 = v;
                }
                break;
            case "y":
                if (this.sizeSource.y === "inherited" || stretch) {
                    if (this._y === undefined) {
                        throw new Error(`Trying to stretch element ${this.ref} with unset position`)
                    }

                    var diff: number = v - this.y;
                    if (diff < 0) {
                        throw new Error(`Flipped element ${this.ref}`)
                    }
                    if (diff === 0) {
                        return
                    }

                    this.height = diff
                } else {
                    this.y2 = v;
                }
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

    // x2 y2
    public get x2() : number {
        if (this.definedHorizontally) {
            return this.x + this.width;
        }
        throw new Error(`${this.ref} not defined horizontally`);
    }
    public set x2(v : number) {
        if (this._contentWidth !== undefined) {
            this.x = v - this.width
        }
    }
    public get y2() : number {
        if (this.definedVertically) {
            return this.y + this.height;
        }
        throw new Error(`${this.ref} not defined vertically`);
    }
    public set y2(v : number) {
        if (this._contentHeight !== undefined) {
            this.y = v - this.height
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
            case "x":
                this.contentWidth = v;
                break;
            case "y":
                this.contentHeight = v;
                break;
        }
    }

    getSizeByDimension(dim: Dimensions): number {
        switch (dim) {
            case "x":
                return this.width;
            case "y":
                return this.height;
        }
    }

    get positionMethod(): PositionMethod {
        var method: PositionMethod = "free";
        if (this.bindingsToThis.length === 2) {
            method = "controlled";
        } else if (this.bindingsToThis.length = 1) {
            method = "partially-controlled"
        }
        return method
    }
}