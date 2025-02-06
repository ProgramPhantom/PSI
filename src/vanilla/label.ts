import Collection, { ICollection } from "./collection";
import { Dimensions } from "./spacial";
import Text, { IText } from "./text";
import { FillObject } from "./util";
import { Visual } from "./visual";


export interface ILabel extends ICollection {
    text: IText
}


export default class Label extends Collection implements ILabel {
    static defaults: {[name: string]: ILabel} = {
        "default": {
            contentWidth: 0,
            contentHeight: 0,
            offset: [0, 0],
            padding: [0, 0, 0, 0],

            text: Text.defaults["default"]
        }
    }

    text: Text;

    constructor(params: ILabel, templateName="default") {
        var fullParams: ILabel = FillObject(params, Label.defaults[templateName])
        super(fullParams, templateName, "label collection")

        this.text = new Text(fullParams.text, undefined, "text in label");
        this.add(this.text);

        this.bind(this.text, Dimensions.X, "centre", "centre", undefined, `Collection ${this.refName} [centre] X> Child ${this.text.refName} [centre]`, true);
        this.bind(this.text, Dimensions.Y, "centre", "centre", undefined, `Collection ${this.refName} [centre] Y> Child ${this.text.refName} [centre]`, true);
    }
}