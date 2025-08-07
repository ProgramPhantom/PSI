import { Svg, Element } from "@svgdotjs/svg.js";
import Label, { ILabel } from "./label";
import { FillObject, RecursivePartial } from "./util";
import { IVisual, Visual } from "./visual";
import { Dimensions } from "./spacial";
import Collection, { ICollection } from "./collection";
import { ElementTypes } from "./point";
import { Position } from "./text";



type Labels = {[key in Position]?: Label} 
type ILabels = {[key in Position]?: ILabel} 

export interface ILabellable extends ICollection {
    labels?: ILabel[]
}


export default class Labellable<T extends Visual=Visual> extends Collection implements ILabellable {
    static defaults: {[name: string]: ILabellable} = {
        "default": {
            contentWidth: 0,
            contentHeight: 0,
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0],

            labels: []
        },
    }
    static ElementType: ElementTypes = "labelled";
    get state(): ILabellable { 
        return {
        x: this._x,
        y: this._y,
        contentWidth: this._contentWidth,
        contentHeight: this._contentHeight,
        padding: this.padding,
        offset: this.offset,
        labels: this.labels.map((l) => {
            return l.state
        }),
        mountConfig: this.mountConfig
    }}


    parentElement: T;


    labels: Label[] = [];
    
    constructor(params: RecursivePartial<ILabellable>, parent: T, templateName: string="default", refName: string="labellable") {
        var fullParams: ILabellable = FillObject<ILabellable>(params, Labellable.defaults[templateName]);
        super(fullParams, templateName, refName);

        this._contentHeight = parent.contentHeight!;
        this._contentWidth = parent.contentWidth!;

        this.mountConfig = parent.mountConfig;

        this.parentElement = parent;
        this.add(parent, undefined, true);

        fullParams.labels?.forEach((label) => {
            var newLabel = new Label(label);
            this.labels.push(newLabel);
            this.bindLabel(newLabel);
        })
    }

    draw(surface: Element) {
        super.draw(surface);

    }

    get id(): string {
        return this.parentElement.id;
    }

    bindLabel(label: Label) {
        switch (label.position) {
            case Position.top:
                this.removeBind(this.parentElement, Dimensions.Y);

                this.parentElement.bind(label, Dimensions.X, "centre", "centre", undefined, `${this.refName} X> ${label.refName}`);

                this.bind(label, Dimensions.Y, "here", "here", undefined, `${this.refName} Y> ${label.refName}`, false);

                this.bind(this.parentElement, Dimensions.X, "centre", "centre", undefined, `Collection ${this.refName} [centre] X> Child ${this.parentElement.refName} [centre]`, true);
                label.bind(this.parentElement, Dimensions.Y, "far", "here", undefined, `Label ${label.refName} Y> Parent ${this.parentElement.refName}`, false)

                this.add(label);
                this._contentHeight = this._contentHeight! + label.height;
                break;
            case Position.right:
                // Override
                this.bind(this.parentElement, Dimensions.Y, "far", "far", undefined, `Collection ${this.refName} [far] Y> Child ${this.parentElement.refName} [far]`)
                
                this.bind(label, Dimensions.Y, "centre", "far", undefined, `Parent ${this.parentElement.refName} [centre] Y> Label ${label.refName} [centre]`)

                this.parentElement.bind(label, Dimensions.X, "far", "here", undefined, `Parent ${this.parentElement.refName} [far] X> Child ${label.refName} [here]`, false)

                this.add(label)
                this._contentWidth = this._contentWidth! + label.width;
                break;
            case Position.bottom:
                this.bind(this.parentElement, Dimensions.X, "centre", "centre", undefined, `Collection ${this.refName} [centre] X> Child ${this.parentElement.refName} [centre]`, true);

                this.parentElement.bind(label, Dimensions.Y, "far", "here", undefined, `Parent ${this.parentElement.refName} [far] Y> Child ${label.refName} [here]`)
                this.parentElement.bind(label, Dimensions.X, "centre", "centre", undefined, `Parent ${this.parentElement.refName} [centre] X> Child ${label.refName} [centre]`)

                this.add(label);
                this._contentHeight = this._contentHeight! + label.height;
                break;
            case Position.left:
                this.removeBind(this.parentElement, Dimensions.X);

                this.bind(label, Dimensions.X, "here", "here", undefined, `${this.refName} X> ${label.refName}`)
                this.bind(label, Dimensions.Y, "centre", "centre", undefined, `${this.refName} Y> ${label.refName}`)

                label.bind(this.parentElement, Dimensions.X, "far", "here", undefined, `${label.refName} Y> ${this.parentElement.refName}`, false)
                this.bind(this.parentElement, Dimensions.Y, "far", "far", undefined, `${this.refName} [far] Y> ${this.parentElement.refName} [far]`)

                this.add(label);
                this._contentWidth = this._contentWidth! + label.width;
                break;
            case Position.centre:
                break;
            default:
                throw new Error("this shouldn't happen");
        }
    }


    // bindParentElement(val: T) {
    //     this.removeBind(this.parentElement);
// 
    //     this.parentElement = val;
    //     this.bind(val, Dimensions.X, "here", "here", undefined, `Collection ${this.refName} X> Parent ${this.parentElement.refName}`, true)
    //     this.bind(val, Dimensions.Y, "here", "here", undefined, `Collection ${this.refName} Y> Parent ${this.parentElement.refName}`, true)
    // }
}