import { Svg } from "@svgdotjs/svg.js";
import { Visual, IVisual, Offset } from "./visual";
import PaddedBox from "./paddedBox";
import Point, { Place } from "./point";
import Spacial, { Bounds, Dimensions } from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS } from "react";
import { SVG } from "@svgdotjs/svg.js";
import { Rect } from "@svgdotjs/svg.js";


export interface ICollection extends IVisual {
    
}

export default class Collection<T extends Spacial = Spacial> extends Visual {
    static defaults: {[name: string]: ICollection} = {
        "default": {
            contentWidth: 0,
            contentHeight: 0,
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0]
        }
    }

    children: T[] = [];
    childBounds: Bounds = {top: 0, bottom: 0, left: 0, right: 0};

    constructor(params: RecursivePartial<ICollection>, templateName: string="default", refName: string="collection") {
        // var test = Collection.defaults[templateName];
        var fullParams: ICollection = FillObject<ICollection>(params, Collection.defaults[templateName]);
        super(fullParams, refName);
    }

    draw(surface: Svg) {
        // --- dev ---
        

        this.children.forEach((c) => {
            if (c instanceof Visual) {
                (c as Visual).draw(surface);
            }
        })

    }

    devDraw(surface: Svg, colour: string="red", offset: number=0) {
        if (!this.debugSvg) {
          this.debugSvg = SVG().id(`debugSvg${this.refName}`)
        } else {
            this.debugSvg.clear()
        }
        
        try {
            // this.debugSvg.remove()
            surface.removeElement(this.debugSvg)
            // console.log(`"Removed debug svg", ${this.debugSvg.dom}`)
        } catch {
            console.error(`"Cannot remove debug svg", ${this.debugSvg}`)
        }

        var debugElement: Element;

        // Children bounds
        this.debugSvg.rect(this.childBounds.right - this.childBounds.left, this.childBounds.bottom - this.childBounds.top)
        .move(this.childBounds.left, this.childBounds.top).fill(colour).attr({"fill-opacity": 0.5}).id("debugSvg");

        // Content Boundary
        this.debugSvg.rect(this.contentWidth, this.contentHeight)
        .move(this.contentBounds.left, this.contentBounds.top).attr({"fill-opacity": 0, "stroke-width": 0.5, "stroke": "red"});

        // Boundary
        this.debugSvg.rect(this.width, this.height)    
        .move(this.bounds.left, this.bounds.top).attr({"stroke-width": 0.3, "stroke": "black", "fill-opacity": 0});

        this.debugSvg.text(this.refName).font({size: 2}).ay(`${this.y+2}`).ax(`${this.x+1}`)

        // ---- Padding hash ----
        // var hash = surface.pattern(4, 4, function(add) {
        //     add.path("M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
        //     .attr({"stroke": "black", "stroke-width": 1, "stroke-opacity": 0.3}).attr({"patternUnits": "userSpaceonUse"})
        // }).attr({"id": "hash"})
        // surface.add(hash)

        // Top
        // this.debugSvg.rect(this.width, this.padding[0])    
        //     .move(this.bounds.left, this.bounds.top).attr({}).fill(hash);
        // // Bottom
        // this.debugSvg.rect(this.width, this.padding[2])    
        //     .move(this.bounds.left, this.contentBounds.bottom).attr({}).fill(hash);
// 
        // // Left
        // this.debugSvg.rect(this.padding[3], this.contentHeight)    
        //     .move(this.bounds.left, this.contentBounds.top).attr({}).fill(hash);
        // // Right
        // this.debugSvg.rect(this.padding[1], this.contentHeight)    
        //     .move(this.contentBounds.right, this.contentBounds.top).attr({}).fill(hash);
// 
        // // this.debugSvg.add(childBounds);
       

        // this.debugSvg.add(childBounds)
        // this.debugSvg.add(contentBounds)
        
        surface.add(this.debugSvg)
        

    }


    add(child: T, index?: number) {
        this.children.splice(index !== undefined ? index : this.children.length-1, 0, child);
        
        child.subscribe(this.computeBoundry.bind(this));

        if (this.isResolved) {
            this.enforceBinding();
        }
        
        this.computeBoundry();

        // A final compute 
    }

    remove(child: T) {
        this.children.forEach((c, i) => {
            if (c === child) {
                this.children.splice(i, 1)
            }
        })

        this.computeBoundry();
        this.enforceBinding();
    }

    computeBoundry(): void {

        var top = Infinity;
        var left = Infinity;
        var bottom = -Infinity;
        var right = -Infinity;

        

        this.children.forEach((c) => {
            if (c.definedVertically) {
                top = c.y < top ? c.y : top;
                bottom = c.getFar(Dimensions.Y) > bottom ? c.getFar(Dimensions.Y) : bottom;
            }
            
            if (c.definedHorizontally) {
                left = c.x < left ? c.x : left;
                right = c.getFar(Dimensions.X) > right ? c.getFar(Dimensions.X) : right;
            }
        })

        if (this.hasPosition) {
            if (top < this.y || left < this.x) {
                // throw new Error("Child has been placed outside of collection content boundary")
                console.warn("Child has been placed outside of collection content boundary")
            }
            top = this.contentY;
            left = this.contentX;
        }
        

        var bounds = {top: top, right: right, bottom: bottom, left: left}
        var width = right - left;
        var height = bottom - top;

        if (width !== -Infinity) {
            this.contentWidth = width;
        }
        if (height !== -Infinity) {
            this.contentHeight = height;
        }

        this.childBounds = {
            top: top,
            bottom: bottom,
            left: left,
            right: right
        }
}

    get contentWidth(): number | undefined {
        // this.computeSize(); // TODO: remove this
        return this._contentWidth;
    }
    get contentHeight(): number | undefined {
        // this.computeSize(); // TODO: remove this
        return this._contentHeight;
    }
    protected set contentWidth(v: number) {
        if (v !== this._contentWidth) {
            this._contentWidth = v;
            this.enforceBinding();
            this.enforceSizeBinding();
            this.notifyChange();
        }
    }
    protected set contentHeight(v: number) {
        if (v !== this._contentHeight) {
            this._contentHeight = v;
            this.enforceBinding();
            this.enforceSizeBinding();
            this.notifyChange();
        }
    }

    get dirty(): boolean {
        var isDirty = false;
        this.children.forEach((c) => {
            if (c instanceof Visual && (c as Visual).dirty) {
                isDirty = true;
            }
        })

        return isDirty;
    }
    set dirty(v: boolean) {
        this.children?.forEach((c) => {
            if (c instanceof Visual) {
                (c as Visual).dirty = v;
            }
        })
    }

    override get hasDimensions(): boolean {
        return true;
    }
}
