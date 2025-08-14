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

            labels: [],
            ref: "default-labellable"
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
        mountConfig: this.mountConfig,
        ref: this.ref
    }}


    parentElement: T;

    public labelDict: {[key in Position]?: Label} = {};
    labels: Label[] = [];
    
    constructor(params: RecursivePartial<ILabellable>, parent: T, templateName: string="default") {
        var fullParams: ILabellable = FillObject<ILabellable>(params, Labellable.defaults[templateName]);
        super(fullParams, templateName);

        this._contentHeight = parent.contentHeight!;
        this._contentWidth = parent.contentWidth!;

        this.mountConfig = parent.mountConfig;
        this.ref = parent.ref + "(parent)";

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
        if (this.labelDict[label.labelConfig.labelPosition] !== undefined) {
            throw new Error("Cannot add a label to the same position twice")
        }

        switch (label.labelConfig.labelPosition) {
            case Position.top:
                this.removeBind(this.parentElement, Dimensions.Y);

                this.parentElement.bind(label, Dimensions.X, "centre", "centre", undefined, `${this.ref} X> ${label.ref}`);

                this.bind(label, Dimensions.Y, "here", "here", undefined, `${this.ref} Y> ${label.ref}`, false);

                label.bind(this.parentElement, Dimensions.Y, "far", "here", undefined, `Label ${label.ref} Y> Parent ${this.parentElement.ref}`, false)

                this.add(label);
                this._contentHeight = this._contentHeight! + label.height; // OPTIMISATION
                break;
            case Position.right:
                this.parentElement.bind(label, Dimensions.Y, "centre", "far", undefined, `Parent ${this.parentElement.ref} [centre] Y> Label ${label.ref} [centre]`)

                this.parentElement.bind(label, Dimensions.X, "far", "here", undefined, `Parent ${this.parentElement.ref} [far] X> Child ${label.ref} [here]`, false)

                this.add(label)
                this._contentWidth = this._contentWidth! + label.width; // OPTIMISATION
                break;
            case Position.bottom:
                this.parentElement.bind(label, Dimensions.Y, "far", "here", undefined, `Parent ${this.parentElement.ref} [far] Y> Child ${label.ref} [here]`)
                this.parentElement.bind(label, Dimensions.X, "centre", "centre", undefined, `Parent ${this.parentElement.ref} [centre] X> Child ${label.ref} [centre]`)

                this.add(label);
                this._contentHeight = this._contentHeight! + label.height; // OPTIMISATION
                break;
            case Position.left:
                this.removeBind(this.parentElement, Dimensions.X);

                this.bind(label, Dimensions.X, "here", "here", undefined, `${this.ref} X> ${label.ref}`)
                this.parentElement.bind(label, Dimensions.Y, "centre", "centre", undefined, `${this.ref} Y> ${label.ref}`)

                label.bind(this.parentElement, Dimensions.X, "far", "here", undefined, `${label.ref} Y> ${this.parentElement.ref}`, false)

                this.add(label);
                this._contentWidth = this._contentWidth! + label.width; // OPTIMISATION
                break;
            case Position.centre:
                throw new Error("Not implemented")
                break;
            default:
                throw new Error(`Unknown label bind location ${label.labelConfig.labelPosition}`);
        }
    }
}