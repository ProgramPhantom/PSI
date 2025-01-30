import { Svg } from "@svgdotjs/svg.js";
import Label, { ILabel } from "./label";
import { RecursivePartial } from "./util";
import { IVisual, Visual } from "./visual";
import { Dimensions } from "./spacial";

export enum Locations {
    Top="top",
    Right="right",
    Bottom="bottom",
    Left="left",
    Centre="centre"
}

type Labels = {[key in Locations]?: Label} 
type ILabels = {[key in Locations]?: ILabel} 

export interface ILabellable extends IVisual {
    labelMap: ILabels
}


export default class Labellable extends Visual implements ILabellable {
    labelMap: Labels = {};
    get labels() : Label[] {
        return Object.values(this.labelMap);
    }
    
    constructor(params: ILabellable, templateName: string="default") {
        super(params, templateName);

        Object.entries(params.labelMap).forEach(([pos, label]) => {
            if (label !== undefined) {
                var newLabel = new Label(label); 
                this.labelMap[<Locations>pos] = newLabel; // TODO: error check here
                this.bindLabel(newLabel, <Locations>pos);
            }
        })
    }

    draw(surface: Svg) {
        this.labels.forEach((l) => {
            l.draw(surface);
        })
    }

    bindLabel(label: Label, pos: Locations) {
        switch (pos) {
            case Locations.Top:
                this.bind(label, Dimensions.X, "centre", "centre", undefined, `${this.refName} X> ${label.refName}`);
                this.bind(label, Dimensions.Y, "here", "far", undefined, `${this.refName} Y> ${label.refName}`, false);
                break;
            case Locations.Right:
                break;
            case Locations.Bottom:
                break;
            case Locations.Left:
                break;
            case Locations.Centre:
                break;
            default:
                throw new Error("this shouldn't happen");
        }
    }
}