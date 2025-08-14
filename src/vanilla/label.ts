import Collection, { ICollection } from "./collection";
import { ILine, Line } from "./line";
import LineLike, { ILineLike } from "./lineLike";
import { Dimensions } from "./spacial";
import Text, { IText, Position } from "./text";
import { FillObject } from "./util";
import { Visual } from "./visual";


export type LabelTextPosition = "top" | "bottom" | "inline"

export interface ILabelConfig {
    labelPosition: Position,
    textPosition: LabelTextPosition
}

export interface ILabel extends ICollection {
    text?: IText ,
    line?: ILine,

    labelConfig: ILabelConfig,
}


export default class Label extends Collection implements ILabel {
    static defaults: {[name: string]: ILabel} = {
        "default": {
            contentWidth: 20,
            contentHeight: 20,
            offset: [0, 0],
            padding: [0, 0, 0, 0],

            text: Text.defaults["default"],
            line: Line.defaults["default"],
            ref: "default-label",
            labelConfig: {
                labelPosition: Position.top,
                textPosition: "top"
            }
        }
    }
    get state(): ILabel {
        return {
            x: this.x,
            y: this.y,
            contentHeight: this.contentHeight,
            contentWidth: this.contentWidth,
            text: this.text?.state,
            line: this.line?.state,
            offset: this.offset,
            padding: this.padding,
            ref: this.ref,

            labelConfig: this.labelConfig
        }
    }

    text?: Text;
    line?: Line;

    labelConfig: ILabelConfig

    constructor(params: ILabel, templateName="default") {
        var fullParams: ILabel = FillObject(params, Label.defaults[templateName])
        super(fullParams, templateName)

        this.labelConfig = fullParams.labelConfig;
        
        if (fullParams.text !== undefined) {
            this.text = new Text(fullParams.text, undefined);

            this.bind(this.text, Dimensions.X, "centre", "centre", undefined, `Collection ${this.ref} [centre] X> Child ${this.text.ref} [centre]`, true);
            this.bind(this.text, Dimensions.Y, "centre", "centre", undefined, `Collection ${this.ref} [centre] Y> Child ${this.text.ref} [centre]`, true);
            this.add(this.text);
        } 
        
        if (fullParams.line !== undefined) {
            this.line = new Line(fullParams.line);

            this.bind(this.line, Dimensions.X, "here", "here", undefined, `Collection ${this.ref} [here] X> Child ${this.line.ref} [here]`, true);
            this.bind(this.line, Dimensions.X, "far", "far", undefined, `Collection ${this.ref} [here] X> Child ${this.line.ref} [far]`, true);


            this.arrangeContent()

            this.add(this.line)
        }
        

    }

    private arrangeContent() {
        if (this.line === undefined || this.text === undefined) {
            throw new Error("Only for use when text and line are present.")
        }

        switch (this.labelConfig.textPosition) {
            case "top":
                this.bind(this.line, Dimensions.Y, "far", "here", undefined, `Collection ${this.ref} [far] Y> Child ${this.line.ref} [here]`, true);
                this.bind(this.line, Dimensions.Y, "far", "far", undefined, `Collection ${this.ref} [far] Y> Child ${this.line.ref} [far]`, true);
                this.text.padding[2] += this.line.style.strokeWidth  // Add bottom padding to text
                break;
            case "inline":
                this.bind(this.line, Dimensions.Y, "centre", "here", undefined, `Collection ${this.ref} [here] Y> Child ${this.line.ref} [here]`, true);
                this.bind(this.line, Dimensions.Y, "centre", "far", undefined, `Collection ${this.ref} [here] Y> Child ${this.line.ref} [far]`, true);
                break;
            case "bottom":
                this.bind(this.line, Dimensions.Y, "here", "here", undefined, `Collection ${this.ref} [here] Y> Child ${this.line.ref} [here]`, true);
                this.bind(this.line, Dimensions.Y, "here", "far", undefined, `Collection ${this.ref} [here] Y> Child ${this.line.ref} [far]`, true);
                this.text.padding[0] += this.line.style.strokeWidth  // Add top padding to text
                break;
            default:
                throw new Error(`Unknown text position ${this.labelConfig.textPosition}`)
        }
    }
}