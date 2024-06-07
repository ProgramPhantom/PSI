import { Svg } from "@svgdotjs/svg.js";
import { Element, IElement, Offset } from "./element";
import PaddedBox from "./paddedBox";
import Point, { Place } from "./point";
import Spacial, { Dimensions } from "./spacial";
import { FillObject } from "./util";
import { DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS } from "react";


export interface ICollection extends IElement {

}

export default class Collection extends Element {
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

    constructor(params: Partial<ICollection>, templateName: string="default", refName: string="collection") {
        // var test = Collection.defaults[templateName];
        var fullParams: ICollection = FillObject<ICollection>(params, Collection.defaults[templateName]);
        super(fullParams, refName);
    }

    draw(surface: Svg) {
        this.children.forEach((c) => {
            if (typeof c === typeof Element) {
                (c as Element).draw(surface);
            }
        })
    }

    add(object: Spacial) {
        this.children.push(object);
    }

    computeSize(): {width: number, height: number} {
        var top = Infinity;
        var left = Infinity;
        var bottom = -Infinity;
        var right = -Infinity;

        this.children.forEach((c) => {
            console.log("bruh")
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

        return {width: width, height: height}
    }

    get contentWidth(): number {
        
        return this.computeSize().width;
    }  // TODO: implement memorisation system;
    get contentHeight(): number {
        this.computeSize();
        return this.computeSize().height;
    }
    protected set contentWidth(v: number) {
        if (v !== undefined) {
            throw new Error("Cannot set content width of collection");
        }
    }
    protected set contentHeight(v: number) {
        if (v !== undefined) {
            throw new Error("Cannot set content width of collection");
        }
    }

    get dirty(): boolean {
        var isDirty = false;
        this.children.forEach((c) => {
            if (typeof c === typeof Element && (c as Element).dirty) {
                isDirty = true;
            }
        })

        return isDirty;
    }
    set dirty(v: boolean) {
        this.children?.forEach((c) => {
            if (typeof c === typeof Element) {
                (c as Element).dirty = v;
            }
        })
    }

    override get hasDimensions(): boolean {
        return true;
    }
}
