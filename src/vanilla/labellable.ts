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
                this.removeBind(this.parentElement, "y");

                this.parentElement.bind(label, "x", "centre", "centre", undefined, `${this.ref} X> ${label.ref}`);

                this.bind(label, "y", "here", "here", undefined, `${this.ref} Y> ${label.ref}`, false);

                label.bind(this.parentElement, "y", "far", "here", undefined, `Label ${label.ref} Y> Parent ${this.parentElement.ref}`, false)

                this.add(label);
                this._contentHeight = this._contentHeight! + label.height; // OPTIMISATION
                break;
            case Position.right:
                this.parentElement.bind(label, "y", "centre", "far", undefined, `Parent ${this.parentElement.ref} [centre] Y> Label ${label.ref} [centre]`)

                this.parentElement.bind(label, "x", "far", "here", undefined, `Parent ${this.parentElement.ref} [far] X> Child ${label.ref} [here]`, false)

                this.add(label)
                this._contentWidth = this._contentWidth! + label.width; // OPTIMISATION
                break;
            case Position.bottom:
                this.parentElement.bind(label, "y", "far", "here", undefined, `Parent ${this.parentElement.ref} [far] Y> Child ${label.ref} [here]`)
                this.parentElement.bind(label, "x", "centre", "centre", undefined, `Parent ${this.parentElement.ref} [centre] X> Child ${label.ref} [centre]`)

                this.add(label);
                this._contentHeight = this._contentHeight! + label.height; // OPTIMISATION
                break;
            case Position.left:
                this.removeBind(this.parentElement, "x");

                this.bind(label, "x", "here", "here", undefined, `${this.ref} X> ${label.ref}`)
                this.parentElement.bind(label, "y", "centre", "centre", undefined, `${this.ref} Y> ${label.ref}`)

                label.bind(this.parentElement, "x", "far", "here", undefined, `${label.ref} Y> ${this.parentElement.ref}`, false)

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

    getTotalLabelHeight(): number {
        var totalHeight: number = 0;
        this.labels.forEach((l) => {
            if (l.labelConfig.labelPosition === Position.top || l.labelConfig.labelPosition === Position.bottom) {
                totalHeight += l.height
            }
        })
        return totalHeight;
    }

    getTotalLabelWidth(): number {
        var totalWidth: number = 0;
        this.labels.forEach((l) => {
            if (l.labelConfig.labelPosition === Position.left || l.labelConfig.labelPosition === Position.right) {
                totalWidth += l.width
            }
        })
        return totalWidth;
    }

    // Override setters for content width and height to change parent element
    override get contentWidth() : number | undefined {
        return this._contentWidth;
    }
    override set contentWidth(v : number | undefined) {
        if (v === undefined) {
            this._contentWidth === undefined;
            this._parentElement?.contentWidth === undefined;
            return
        }

        if (v !== this._contentWidth) {
            this._contentWidth = v;

            if (this.sizeSource.x === "inherited") {
                this.parentElement.contentWidth = v - this.getTotalLabelWidth();
            }

            this.enforceBinding();
            this.notifyChange();
        }
    }

    override get contentHeight() : number | undefined {
        return this._contentHeight;
    }
    override set contentHeight(v : number | undefined) {
        if (v === undefined) {
            this._contentHeight === undefined;
            this._parentElement?.contentHeight === undefined;
            return
        }

        if (v !== this.contentHeight) {
            this._contentHeight = v;

            if (this.sizeSource.y === "inherited") {
                this.parentElement.contentHeight = v - this.getTotalLabelHeight();
            }
            

            this.enforceBinding();
            this.notifyChange();
        }
    }
}