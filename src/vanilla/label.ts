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
import { G } from "@svgdotjs/svg.js";
import { SVG } from "@svgdotjs/svg.js";
import { Mask } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";


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
 
    draw(surface: Svg) {
        if (this.svg) {
            this.svg.remove();
        }
        
        var group = new G().id(this.id).attr({"title": this.ref});

        var hitbox = new Rect().attr({"data-editor": "hitbox", "zIndex": -1}).x(this.x).y(this.y)
                                .width(this.width).height(this.height).fill("transparent").id(this.id)
                                .stroke("none")


        
        surface.add(hitbox);
        
        // Clip

        var text = this.text;
        var arrow = this.line;

        this.svg = SVG();

        var area = SVG().rect(10, 10).move(this.getCentre("x") ?? 0, this.getCentre("y") ?? 0)
        this.svg.add(area)
        var clippingRect = SVG().clip()

        if (arrow) {

            

            arrow.draw(surface);
        }
        if (text) {
            text.draw(surface)

            const SPILL_PADDING = 4;
            const TEXT_PADDING = 1;

            if (text.svg && arrow && arrow.svg) {
                var maskID: string = this.id + "-MASK";
                var visibleArea = new Rect().move(this.x-SPILL_PADDING, this.y-SPILL_PADDING).size(this.width+2*SPILL_PADDING, this.height+2*SPILL_PADDING).fill("white");
                var blockedArea = new Rect().move(text.x-TEXT_PADDING, text.y-TEXT_PADDING)
                    .size((text.contentWidth ?? 0) +2*TEXT_PADDING, (text.contentHeight ?? 0) + 2*TEXT_PADDING).fill("black");

                var newMask = new Mask().add(visibleArea).add(blockedArea)
                .id(maskID).attr({"mask-type": "luminance", "maskUnits": "userSpaceOnUse"});

                // VERY IMPORTANT: use "useSpaceOnUse" to follow the user coordinates not some random bs coord system

                surface.add(newMask)

                arrow.svg.attr({"mask": `url(#${maskID})`})
            }
        }
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