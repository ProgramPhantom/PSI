import { Svg, Element } from "@svgdotjs/svg.js";
import Label, { ILabel } from "./label";
import { FillObject, RecursivePartial } from "./util";
import { IVisual, Visual } from "./visual";
import { Dimensions } from "./spacial";
import Collection, { ICollection } from "./collection";
import { Position } from "./text";
import { UserComponentType } from "./diagramHandler";
import SVGElement from "./svgElement";



type Labels = {[key in Position]?: Label} 
type ILabels = {[key in Position]?: ILabel} 

export interface ILabellable extends ICollection {
    labels?: ILabel[],
    coreChild: IVisual,
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
            ref: "default-labellable",
            coreChild: SVGElement.namedElements["180"]
        },
    }
    static ElementType: UserComponentType = "labellable";
    get state(): ILabellable { 
        return {
        labels: this.labels.map((l) => {
            return l.state
        }),
        coreChild: this.coreChild.state,
        ...super.state,
        contentWidth: this.coreChild.contentWidth,
        contentHeight: this.coreChild.contentHeight,
    }}


    coreChild: T;

    public labelDict: {[key in Position]?: Label} = {};
    labels: Label[] = [];
    
    constructor(params: RecursivePartial<ILabellable>, coreChild: T, templateName: string="default") {
        var fullParams: ILabellable = FillObject<ILabellable>(params, Labellable.defaults[templateName]);
        super(fullParams, templateName);

        this._contentHeight = coreChild.contentHeight!;
        this._contentWidth = coreChild.contentWidth!;

        this.mountConfig = {...coreChild.mountConfig!};
        // parent.mountConfig = undefined;

        // this.ref = "labelled-" + coreChild.ref;
        this.ref = coreChild.ref;

        this.coreChild = coreChild;

        this.add(coreChild, undefined, true);
    
        fullParams.labels?.forEach((label) => {
            var newLabel = new Label(label);
            this.labels.push(newLabel);
            this.bindLabel(newLabel);
        })

        // Currently no way to select coreChild, so to stop padding being applied to child and labellable, for now
        // we'll just set the child padding to 0
        this.coreChild.padding = [0, 0, 0, 0]
    }

    draw(surface: Element) {
        super.draw(surface);
    }

    // get id(): string {
    //     return this.parentElement.id;
    // }

    bindLabel(label: Label) {
        if (this.labelDict[label.labelConfig.labelPosition] !== undefined) {
            throw new Error("Cannot add a label to the same position twice")
        }

        switch (label.labelConfig.labelPosition) {
            case Position.top:
                // X
                label.sizeSource.x = "inherited"
                this.coreChild.bind(label, "x", "here", "here");
                this.coreChild.bind(label, "x", "far", "far");

                this.clearBindsTo(this.coreChild, "x");
                this.bind(this.coreChild, "x", "centre", "centre");
                
                // Y
                this.clearBindsTo(this.coreChild, "y");
                this.bind(label, "y", "here", "here", undefined, undefined, false);
                label.bind(this.coreChild, "y", "far", "here", undefined, undefined, false);

                this.add(label);
                this._contentHeight = this._contentHeight! + label.height; // OPTIMISATION
                break;
            case Position.right:
                // Y
                label.sizeSource.y = "inherited"
                this.coreChild.bind(label, "y", "here", "here", undefined)
                this.coreChild.bind(label, "y", "far", "far")

                // X
                this.coreChild.bind(label, "x", "far", "here", undefined, undefined, false)

                this.add(label)
                this._contentWidth = this._contentWidth! + label.width; // OPTIMISATION
                break;
            case Position.bottom:
                // Y
                this.coreChild.bind(label, "y", "far", "here")
                
                // X
                label.sizeSource.x = "inherited"
                this.coreChild.bind(label, "x", "here", "here")
                this.coreChild.bind(label, "x", "far", "far")

                this.clearBindsTo(this.coreChild, "x");
                this.bind(this.coreChild, "x", "centre", "centre");

                this.add(label);
                this._contentHeight = this._contentHeight! + label.height; // OPTIMISATION
                break;
            case Position.left:
                // Y
                label.sizeSource.y = "inherited"
                this.coreChild.bind(label, "y", "here", "here")
                this.coreChild.bind(label, "y", "far", "far")

                // X
                this.clearBindsTo(this.coreChild, "x");
                this.bind(label, "x", "here", "here")
                label.bind(this.coreChild, "x", "far", "here", undefined, undefined, false)

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
                this.coreChild.contentWidth = v - this.getTotalLabelWidth();
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
                this.coreChild.contentHeight = v - this.getTotalLabelHeight();
            }
            

            this.enforceBinding();
            this.notifyChange();
        }
    }
}