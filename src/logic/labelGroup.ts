import { Element } from "@svgdotjs/svg.js";
import { FormBundle } from "../features/form/LabelGroupComboForm";
import VisualForm from "../features/form/VisualForm";
import Collection, { ICollection } from "./collection";
import DiagramHandler, { UserComponentType } from "./diagramHandler";
import Label, { ILabel } from "./label";
import RectElement, { IRectElement } from "./rectElement";
import SVGElement, { ISVGElement } from "./svgElement";
import { Position } from "./text";
import { CreateChild, FillObject, RecursivePartial } from "./util";
import { IVisual, Visual } from "./visual";


export interface ILabelGroup extends ICollection {
    labels: ILabel[],
    coreChild: IVisual,
    coreChildType: UserComponentType
}


export default class LabelGroup<T extends Visual=Visual> extends Collection implements ILabelGroup {

    static namedElements: {[name: string]: ILabelGroup} = {
        "default": {
            contentWidth: 0,
            contentHeight: 0,
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0],

            labels: [],
            ref: "default-labellable",
            coreChild: SVGElement.namedElements["180"],
            coreChildType: "svg",
            userChildren: []
        },
    }
    static ElementType: UserComponentType = "label-group";
    static formData: FormBundle<ILabelGroup> = {form: VisualForm, defaults: LabelGroup.namedElements["form-defaults"], allowLabels: true};
    // Todo: fix this
    get state(): ILabelGroup { 
        return {
        labels: this.labels.map((l) => {
            return l.state
        }),
        coreChild: this.coreChild.state,
        coreChildType: this.coreChildType,
        ...super.state,
        contentWidth: this.coreChild.contentWidth,
        contentHeight: this.coreChild.contentHeight,
    }}


    coreChild: T;
    coreChildType: UserComponentType;

    public labelDict: {[key in Position]?: Label} = {};
    labels: Label[] = [];
    
    constructor(params: RecursivePartial<ILabelGroup>, coreChild?: T, templateName: string="default") {
        var fullParams: ILabelGroup = FillObject<ILabelGroup>(params, LabelGroup.namedElements[templateName]);
        super(fullParams, templateName);

        this.coreChildType = fullParams.coreChildType;

        if (coreChild !== undefined) {
            this.coreChild = coreChild;
        } else {
            this.coreChild = CreateChild(fullParams.coreChild, fullParams.coreChildType) as T;
        }
        

        this._contentHeight = this.coreChild.contentHeight!;
        this._contentWidth = this.coreChild.contentWidth!;

        this.mountConfig = fullParams.mountConfig;
        // parent.mountConfig = undefined;

        // this.ref = "labelled-" + coreChild.ref;
        this.ref = this.coreChild.ref;

        this.add(this.coreChild, undefined, true);
    
        fullParams.labels?.forEach((label) => {
            var newLabel = new Label(label);
            this.labels.push(newLabel);
            this.bindLabel(newLabel);
        })
    }

    draw(surface: Element) {
        super.draw(surface);
    }


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
                this.bind(label, "y", "here", "here", undefined, undefined, true);
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