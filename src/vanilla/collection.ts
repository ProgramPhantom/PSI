import { Svg } from "@svgdotjs/svg.js";
import { Visual, IVisual, Offset } from "./visual";
import PaddedBox from "./paddedBox";
import Point, { Place } from "./point";
import Spacial, { Dimensions } from "./spacial";
import { FillObject, RecursivePartial } from "./util";
import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS } from "react";


export interface ICollection extends IVisual {

}

export default class Collection extends Visual {
    static defaults: {[name: string]: ICollection} = {
        "default": {
            width: 0,
            height: 0,
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0]
        }
    }

    children: Spacial[] = [];

    constructor(params: RecursivePartial<ICollection>, templateName: string="default", refName: string="collection") {
        // var test = Collection.defaults[templateName];
        var fullParams: ICollection = FillObject<ICollection>(params, Collection.defaults[templateName]);
        super(fullParams, refName);
    }

    draw(surface: Svg) {
        this.children.forEach((c) => {
            if (typeof c === typeof Visual) {
                (c as Visual).draw(surface);
            }
        })
    }

    add(object: Spacial, index?: number) {
        this.children.splice(index !== undefined ? index : this.children.length-1, 0, object)
        this.computeSize();
    }

    computeSize(): void {
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

        var bounds = {top: top, right: right, bottom: bottom, left: left}
        var width = right - left;
        var height = bottom - top;

        if (width !== -Infinity) {
            this.contentWidth = width;
        }
        if (height !== -Infinity) {
            this.contentHeight = height;
        }
       
    }

    get contentWidth(): number | undefined {
        this.computeSize(); // TODO: remove this
        return this._contentWidth;
    }
    get contentHeight(): number | undefined {
        this.computeSize(); // TODO: remove this
        return this._contentHeight;
    }
    private set contentWidth(v: number) {
        if (v !== this._contentWidth) {
            this._contentWidth = v;
            this.enforceBinding();
            this.enforceSizeBinding();
        }
    }
    private set contentHeight(v: number) {
        if (v !== this._contentHeight) {
            this._contentHeight = v;
            this.enforceBinding();
            this.enforceSizeBinding();
        }
    }

    get dirty(): boolean {
        var isDirty = false;
        this.children.forEach((c) => {
            if (typeof c === typeof Visual && (c as Visual).dirty) {
                isDirty = true;
            }
        })

        return isDirty;
    }
    set dirty(v: boolean) {
        this.children?.forEach((c) => {
            if (typeof c === typeof Visual) {
                (c as Visual).dirty = v;
            }
        })
    }

    override get hasDimensions(): boolean {
        return true;
    }
}
