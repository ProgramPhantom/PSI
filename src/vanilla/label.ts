import Collection, { ICollection } from "./collection";
import { Dimensions } from "./spacial";
import Text, { IText, Position } from "./text";
import { FillObject } from "./util";
import { Visual } from "./visual";


export interface ILabel extends ICollection {
    text: IText,
    position: Position
}


export default class Label extends Collection implements ILabel {
    static defaults: {[name: string]: ILabel} = {
        "default": {
            contentWidth: 20,
            contentHeight: 20,
            offset: [0, 0],
            padding: [0, 0, 0, 0],

            text: Text.defaults["default"],
            position: Position.top
        }
    }
    get state(): ILabel {
        return {
            x: this.x,
            y: this.y,
            contentHeight: this.contentHeight,
            contentWidth: this.contentWidth,
            text: this.text.state,
            offset: this.offset,
            padding: this.padding,
            position: this.position
        }
    }

    text: Text;
    position: Position;

    constructor(params: ILabel, templateName="default") {
        var fullParams: ILabel = FillObject(params, Label.defaults[templateName])
        super(fullParams, templateName, "label collection")

        this.text = new Text(fullParams.text, undefined, "text in label");
        this.position = fullParams.position;
        this.add(this.text);

        this.bind(this.text, Dimensions.X, "centre", "centre", undefined, `Collection ${this.refName} [centre] X> Child ${this.text.refName} [centre]`, true);
        this.bind(this.text, Dimensions.Y, "centre", "centre", undefined, `Collection ${this.refName} [centre] Y> Child ${this.text.refName} [centre]`, true);
    }
}