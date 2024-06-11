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

    add(object: Spacial) {
        this.children.push(object);
    }

    computeSize(): void {
        var top = Infinity;
        var left = Infinity;
        var bottom = -Infinity;
        var right = -Infinity;

        this.children.forEach((c) => {
            
            if (c.hasDimensions && c.hasPosition) {
                top = c.y < top ? c.y : top;
                left = c.x < left ? c.x : left;
                bottom = c.getFar(Dimensions.Y) > bottom ? c.getFar(Dimensions.Y) : bottom;
                right = c.getFar(Dimensions.X) > right ? c.getFar(Dimensions.X) : right;
            }
        })

        var bounds = {top: top, right: right, bottom: bottom, left: left}
        var width = right - left;
        var height = bottom - top;

        this._contentWidth = width;
        this._contentHeight = height;
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
        this._contentWidth = v;
    }
    private set contentHeight(v: number) {
        this._contentHeight = v;
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
