import Collection, { ICollection } from "./collection";
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
            x: undefined,
            y: undefined,
            offset: [0, 0],
            padding: [0, 0, 0, 0],

            text: Text.defaults["default"]
        }
    }

    text: Text;

    constructor(params: ILabel, templateName="default") {
        var fullParams: ILabel = FillObject(params, Label.defaults[templateName])
        super(fullParams, templateName)

        this.text = new Text(fullParams.text);
    }
}