import { Svg } from "@svgdotjs/svg.js";
import { Visual, IVisual, Offset, IDraw, doesDraw } from "./visual";
import PaddedBox from "./paddedBox";
import Point, { Place } from "./point";
import Spacial, { Bounds, Dimensions } from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS } from "react";
import logger, { Operations, Processes } from "./log";
import { SVG } from "@svgdotjs/svg.js";
import { Element } from "@svgdotjs/svg.js";
import { G } from "@svgdotjs/svg.js";


export interface ICollection extends IVisual {
    
}

export default class Collection<T extends Spacial = Spacial> extends Visual implements IDraw {
    static defaults: {[name: string]: ICollection} = {
        "default": {
            contentWidth: 0,
            contentHeight: 0,
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0],


        },
    }

    _parentElement?: T;
    children: T[] = [];
    childBounds: Bounds = {top: 0, bottom: 0, left: 0, right: 0};

    constructor(params: RecursivePartial<ICollection>, templateName: string="default", refName: string="collection") {
        var fullParams: ICollection = FillObject<ICollection>(params, Collection.defaults[templateName]);
        super(fullParams, refName);
    }

    draw(surface: Element) {
        var group = new G().id(this.id);

        this.children.forEach((c) => {
            if (doesDraw(c)) {
                c.draw(group);
            }
        })

        // group.move(this.x, this.y).size(this.width, this.height)
        surface.add(group)
    }

    add(child: T, index?: number, bindHere: boolean = false) {
        this.children.splice(index !== undefined ? index : this.children.length-1, 0, child);
        
        child.subscribe(this.computeBoundary.bind(this));

        if (bindHere) {
            this.bind(child, Dimensions.X, "here", "here", undefined, `Collection ${this.refName} X> Child ${child.refName}`, true);
            this.bind(child, Dimensions.Y, "here", "here", undefined, `Collection ${this.refName} Y> Child ${child.refName}`, true);
        }

        if (this.isResolved) {
            this.enforceBinding();
        }

        // A final compute 
    }

    erase(): void {
        this.children.forEach((c) => {
            if (doesDraw(c)) {
                c.erase();
            }
        })
    }

    remove(child: T) {
        this.children.forEach((c, i) => {
            if (c === child) {
                this.children.splice(i, 1);

                if (c instanceof Visual) {
                    c.erase();
                }

                this.removeBind(child);
            }
        })

        this.computeBoundary();
        this.enforceBinding();
    }

    removeAt(index: number) {
        this.children.splice(index, 1);

        this.computeBoundary();
        this.enforceBinding();
    }

    setParent(element: T) {
        var found = false;
        this.children.forEach((c) => {
            if (c == element) {
                found = true
            }
        })

        if (!found) {
            throw new Error("Error target parent not found in collection");
        }

        this._parentElement = element;
    }

    computeBoundary(): void {
        logger.processStart(Processes.COMPUTE_BOUNDARY, ``, this)

        if (this.children.filter((f) => f.displaced === true).length > 0) {
            logger.performance(`ABORT COMPUTE BOUNDARY[${typeof this}]: ${this.refName}`)
            console.groupEnd()
            return
        }

        var top = Infinity;
        var left = Infinity;
        var bottom = -Infinity;
        var right = -Infinity;



        this.children.forEach((c) => {
            if (c.definedVertically) {
                top = c.y < top ? c.y : top;

                var far = c.getFar(Dimensions.Y);
                bottom = far === undefined ? -Infinity : far  > bottom ? far : bottom;
            }
            
            if (c.definedHorizontally) {
                left = c.x < left ? c.x : left;

                var farX = c.getFar(Dimensions.X);
                right = farX === undefined ? -Infinity : farX > right ? farX : right;
            }
        })

        // Include current location in boundary.
        // This fixes a problem for the positional columns where the correct size of the boundary would be computed
        // as if the collection was positioned at the top left element, but would not actually be in the correct location.
        if (this.definedVertically && this.contentY < top) {
            top = this.contentY
        }
        if (this.definedHorizontally &&  this.contentX < left) {
            left = this.contentX;
        }

        

        var bounds = {top: top, right: right, bottom: bottom, left: left}
        var width = right - left;
        var height = bottom - top;
        


        if (width !== -Infinity) {
            this.contentWidth = width;
        } else {
            // this.contentWidth = 0;
        }
        if (height !== -Infinity) {
            this.contentHeight = height;
        } else {
            // this.contentHeight = 0;
        }

        this.childBounds = {
            top: top,
            bottom: bottom,
            left: left,
            right: right
        }

        logger.processEnd(Processes.COMPUTE_BOUNDARY, `${this.refName}`, this)
    } 

    get contentWidth(): number | undefined {
        return this._contentWidth;
    }
    get contentHeight(): number | undefined {
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
