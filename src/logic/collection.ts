import { Element, G } from "@svgdotjs/svg.js";
import logger, { Processes } from "./log";
import { ID } from "./point";
import Spacial, { Bounds } from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { IDraw, IVisual, Visual, doesDraw } from "./visual";
import { SVG } from "@svgdotjs/svg.js";
import { Rect } from "@svgdotjs/svg.js";
import { IHaveStructure } from "./diagramHandler";


export function HasStructure(obj: any): obj is IHaveStructure {
    return (obj.structure !== undefined)
}


export interface ICollection extends IVisual {
    userChildren: IVisual[]
}
export default class Collection<T extends Visual = Visual> extends Visual implements IDraw {
    static defaults: {[name: string]: ICollection} = {
        "default": {
            contentWidth: 0,
            contentHeight: 0,
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0],
            ref: "default-collection",
            userChildren: []
        },
    }
    get state(): ICollection {
        return {
            userChildren: this.userChildren.map(c => c.state),
            ...super.state
        }
    }


    _parentElement?: T;
    children: T[] = [];
    

    get userChildren(): T[] {
        return this.children.filter(c => HasStructure(this) ? !Object.values(this.structure).includes(c) : true)
    }

    constructor(params: RecursivePartial<ICollection>, templateName: string=Collection.defaults["default"].ref) {
        var fullParams: ICollection = FillObject<ICollection>(params, Collection.defaults[templateName]);
        super(fullParams);
    }

    draw(surface: Element) {
        if (this.svg) {
            this.svg.remove();
        }

        var group = new G().id(this.id).attr({"title": this.ref});
        group.attr({"transform": `translate(${this.offset[0]}, ${this.offset[1]})`})

        this.children.forEach((c) => {
            if (doesDraw(c)) {
                c.draw(group);
            }
        })

        // group.move(this.x, this.y).size(this.width, this.height)
        this.svg = group;

        surface.add(this.svg);
    }


    public getHitbox(): Rect[] {
        var collectionHitbox = SVG().rect().id(this.id + "-hitbox").attr({"data-editor": "hitbox", key: this.ref});

        collectionHitbox.size(this.width, this.height);
        collectionHitbox.move(this.x, this.y);
        collectionHitbox.fill(`transparent`).opacity(0.3);

        var childHitboxes: Rect[] = [];
        
        for (var child of this.children) {
            if (child instanceof Visual) {
                childHitboxes.push(...child.getHitbox());
            }
        }


        return [collectionHitbox, ...childHitboxes];
    }
 

    add(child: T, index?: number, bindHere: boolean = false, setParentId: boolean=true) {
        if (setParentId) {child.parentId = this.id};
        this.children.splice(index !== undefined ? index : this.children.length-1, 0, child);
        
        child.subscribe(this.computeBoundary.bind(this));

        if (bindHere) {
            this.bind(child, "x", "here", "here", undefined);
            this.bind(child, "y", "here", "here", undefined);
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

                this.clearBindsTo(child);
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

    removeAll() {
        this.children.forEach((c) => {
            this.remove(c);
        })
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
            logger.performance(`ABORT COMPUTE BOUNDARY[${typeof this}]: ${this.ref}`)
            console.groupEnd()
            return
        }

        if (this.ref === "default-paddedbox") {
            console.log()
        }

        var top = Infinity;
        var left = Infinity;
        var bottom = -Infinity;
        var right = -Infinity;



        this.children.forEach((c) => {
            if (c.definedVertically) {
                top = c.y < top ? c.y : top;

                var far = c.getFar("y");
                bottom = far === undefined ? -Infinity : far  > bottom ? far : bottom;
            }
            
            if (c.definedHorizontally) {
                left = c.x < left ? c.x : left;

                var farX = c.getFar("x");
                right = farX === undefined ? -Infinity : farX > right ? farX : right;
            }
        })

        // Include current location in boundary.
        // This fixes a problem for the positional columns where the correct size of the boundary would be computed
        // as if the collection was positioned at the top left element, but would not actually be in the correct location.
        // if (this.definedVertically && this.contentY < top) {
        //     top = this.contentY
        // }
        // if (this.definedHorizontally &&  this.contentX < left) {
        //     left = this.contentX;
        // }
        // Don't know why I had that. The dimensions of a collection ARE defined by the children.

        

        var width = right - left;
        var height = bottom - top;
        


        if (width !== -Infinity && this.sizeSource.x !== "inherited") {
            this.contentWidth = width;
        } else {
            // this.contentWidth = 0;
        }
        if (height !== -Infinity && this.sizeSource.y !== "inherited") {
            this.contentHeight = height;
        } else {
            // this.contentHeight = 0;
        }


        logger.processEnd(Processes.COMPUTE_BOUNDARY, `Left: ${left}, Right: ${right}, Top: ${top}, Bottom: ${bottom}`, this)
    }

    // Construct and SVG with children positioned relative to (0, 0)
    override getInternalRepresentation(): Element | undefined {
        try {
            var deltaX = -this.contentX;
            var deltaY = -this.contentY;
        }  catch (err) {
            var deltaX = 0;
            var deltaY = 0;
        }
        
        // 

        var internalSVG = this.svg?.clone(true, true);
        internalSVG?.attr({"style": "display: block;"}).attr({"transform": `translate(${deltaX}, ${deltaY})`})

        return internalSVG;
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
            this.notifyChange();
        }
    }
    protected set contentHeight(v: number) {
        if (v !== this._contentHeight) {
            this._contentHeight = v;
            this.enforceBinding();
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

    override get allElements(): Record<ID, Visual> {
        var elements: Record<ID, Visual> = {[this.id]: this};

        this.children.forEach((c) => {
            if (c instanceof Visual) {
                elements = {...elements, ...c.allElements}
            }
        })
        return elements;
    }
}
