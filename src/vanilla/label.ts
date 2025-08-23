import { Element } from "@svgdotjs/svg.js";
import Arrow, { IArrow } from "./arrow";
import Collection, { ICollection } from "./collection";
import { ILine, Line } from "./line";
import LineLike, { ILineLike } from "./lineLike";
import { Dimensions } from "./spacial";
import Text, { IText, Position } from "./text";
import { FillObject } from "./util";
import { Visual } from "./visual";
import { Rect } from "@svgdotjs/svg.js";


export type LabelTextPosition = "top" | "bottom" | "inline"

export interface ILabelConfig {
    labelPosition: Position,
    textPosition: LabelTextPosition
}

export interface ILabel extends ICollection {
    text?: IText ,
    line?: IArrow,

    labelConfig: ILabelConfig,
}


export default class Label extends Collection implements ILabel {
    static defaults: {[name: string]: ILabel} = {
        "default": {
            contentWidth: 20,
            contentHeight: 20,
            offset: [0, 0],
            padding: [2, 0, 2, 0],

            text: Text.defaults["default"],
            line: Arrow.defaults["default"],
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
    line?: Arrow;

    labelConfig: ILabelConfig

    constructor(params: ILabel, templateName="default") {
        var fullParams: ILabel = FillObject(params, Label.defaults[templateName])
        super(fullParams, templateName)

        this.labelConfig = fullParams.labelConfig;
        
        if (fullParams.text !== undefined) {
            this.text = new Text(fullParams.text, undefined);

            this.bind(this.text, "x", "centre", "centre", undefined);
            this.bind(this.text, "y", "centre", "centre", undefined);
            this.add(this.text);
        } 
        
        if (fullParams.line !== undefined) {
            this.line = new Arrow(fullParams.line);

            var orientationSelect: Dimensions;
            switch (this.labelConfig.labelPosition) {
                case Position.top:
                case Position.bottom:
                    orientationSelect = "y";
                    break;
                case Position.left:
                case Position.right:
                    orientationSelect = "x"
                    break;
                default:
                    orientationSelect = "y"
            }
            var otherDimension: Dimensions = orientationSelect === "x" ? "y" : "x" 

            this.bind(this.line, otherDimension, "here", "here");
            this.bind(this.line, otherDimension, "far", "far");

            this.arrangeContent(orientationSelect)

            this.add(this.line)
        }
    }
 
    draw(surface: Element) {
        var hitbox = new Rect().attr({"data-editor": "hitbox", "zIndex": -1}).x(this.x).y(this.y)
                                .width(this.width).height(this.height).fill("transparent").id(this.id)
                                .stroke("none")
        surface.add(hitbox);
        super.draw(surface);
    }

    private arrangeContent(orientation: Dimensions) {
        if (this.line === undefined || this.text === undefined) {
            throw new Error("Only for use when text and line are present.")
        }

        switch (this.labelConfig.textPosition) {
            case "top":
                this.bind(this.line, orientation, "far", "here");
                this.bind(this.line, orientation, "far", "far");
                // this.text.padding[2] += this.line.style.thickness  // Add bottom padding to text
                break;
            case "inline":
                this.bind(this.line, orientation, "centre", "here");
                this.bind(this.line, orientation, "centre", "far");
                break;
            case "bottom":
                this.bind(this.line, orientation, "here", "here");
                this.bind(this.line, orientation, "here", "far");
                // this.text.padding[0] += this.line.style.thickness  // Add top padding to text
                break;
            default:
                throw new Error(`Unknown text position ${this.labelConfig.textPosition}`)
        }
    }
}