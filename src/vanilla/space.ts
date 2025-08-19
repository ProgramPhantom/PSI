import { Visual, IVisual, IDraw } from "./visual";
import { FillObject, RecursivePartial } from "./util";
import { simplePulses } from "./default/data/simplePulse";
import defaultBar from "./default/data/bar.json";
import { Element } from "@svgdotjs/svg.js";
import { ElementTypes } from "./point";
import VisualForm from "../form/VisualForm";
import Mountable, { IMountable } from "./mountable"; 
import { defaultSpace } from "./default/data";


export interface ISpace extends IVisual {

}

export default class Space extends Visual implements ISpace, IDraw {
    static defaults: {[key: string]: ISpace } = {"default": <any>defaultSpace};
    get state(): ISpace { return {
        x: this.x,
        y: this.y,
        contentWidth: this.contentWidth,
        contentHeight: this.contentHeight,
        padding: this.padding,
        ref: this.ref,
        offset: this.offset,
        mountConfig: this.mountConfig
    }}
    static ElementType: ElementTypes = "rect";
    static form: React.FC = VisualForm;


    constructor(params: RecursivePartial<ISpace>, templateName: string="default") {
        var fullParams: ISpace = FillObject(params, Space.defaults[templateName])
        super(fullParams);
    }

    draw(surface: Element) {}
    erase() {}
}