import { G, Mask, Rect, Svg } from "@svgdotjs/svg.js";
import LabelForm from "../features/form/LabelForm";
import { FormBundle } from "../features/form/LabelGroupComboForm";
import Line, { ILine } from "./line";
import Collection, { ICollection, IHaveComponents } from "./collection";
import {  UserComponentType } from "./diagramHandler";
import Spacial, { Dimensions } from "./spacial";
import Text, { IText, Position } from "./text";

interface ILabelComponents extends Record<string, Spacial | Spacial[]> {
    text?: Text,
    line?: Line
}

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


export default class Label extends Collection implements ILabel, IHaveComponents<ILabelComponents> {
    static namedElements: {[name: string]: ILabel} = {
        "default": {
            contentWidth: 20,
            contentHeight: 20,
            offset: [0, 0],
            padding: [2, 0, 2, 0],
            userChildren: [],

            text: Text.defaults["default"],
            line: Line.defaults["default"],
            ref: "default-label",
            labelConfig: {
                labelPosition: "top",
                textPosition: "top"
            }
        },
        "form-defaults": {
            contentWidth: 20,
            contentHeight: 20,
            offset: [0, 0],
            padding: [2, 0, 2, 0],
            userChildren: [],

            text: Text.defaults["default"],
            line: Line.defaults["default"],
            ref: "default-label",
            labelConfig: {
                labelPosition: "top",
                textPosition: "top"
            }
        }
    }
    get state(): ILabel {
        return {
            text: this.components.text?.state,
            line: this.components.line?.state,
            labelConfig: this.labelConfig,
            ...super.state
        }
    }
    static formData: FormBundle<ILabel> = {form: LabelForm, defaults: Label.namedElements["form-defaults"], allowLabels: false};
    static ElementType: UserComponentType = "label";

    components: ILabelComponents;

    labelConfig: ILabelConfig

    constructor(params: ILabel, templateName="default") {
        // When arrow is undefined, this was filling it with the default arrow. Maybe null is preferable?
        // var fullParams: ILabel = FillObject(params, Label.defaults[templateName])
        var fullParams: ILabel = params;
        super(fullParams, templateName)
        this.labelConfig = fullParams.labelConfig;
        
        if (fullParams.text !== undefined) {
            // Create text
            var text: Text = new Text(fullParams.text, undefined);

            this.bind(text, "x", "centre", "centre");
            this.bind(text, "y", "centre", "centre");
            this.add(text);
        }
        
        if (fullParams.line !== undefined) {
            // Create line
            var line: Line = new Line(fullParams.line);

            var orientationSelect: Dimensions;
            switch (this.labelConfig.labelPosition) {
                case "top":
                case "bottom":
                    orientationSelect = "y";
                    break;
                case "left":
                case "right":
                    orientationSelect = "x"
                    break;
                default:
                    orientationSelect = "y"
            }
            var otherDimension: Dimensions = orientationSelect === "x" ? "y" : "x" 

            this.bind(line, otherDimension, "here", "here");
            this.bind(line, otherDimension, "far", "far");

            this.arrangeContent(orientationSelect)

            this.add(line)
        }

        this.components = {
            "line": line,
            "text": text
        }
    }
 
    draw(surface: Svg) {
        if (this.svg) {
            this.svg.remove();
        }
        
        var group = new G().id(this.id).attr({"title": this.ref});
        
        // Clip

        if (this.components.line) {
            this.components.line.draw(surface);
        }
        if (this.components.text) {
            this.components.text.draw(surface);

            const SPILL_PADDING = 4;
            const TEXT_PADDING = 1;

            if (this.components.line && this.components.line.svg !== undefined && this.components.text.svg) {
                var maskID: string = this.id + "-MASK";
                var visibleArea = new Rect().move(this.x-SPILL_PADDING, this.y-SPILL_PADDING).size(this.width+2*SPILL_PADDING, this.height+2*SPILL_PADDING).fill("white");
                var blockedArea = new Rect().move(this.components.text.x-TEXT_PADDING, this.components.text.y-TEXT_PADDING)
                    .size((this.components.text.contentWidth ?? 0) +2*TEXT_PADDING, (this.components.text.contentHeight ?? 0) + 2*TEXT_PADDING).fill("black");

                var newMask = new Mask().add(visibleArea).add(blockedArea)
                .id(maskID).attr({"mask-type": "luminance", "maskUnits": "userSpaceOnUse"});

                // VERY IMPORTANT: use "useSpaceOnUse" to follow the user coordinates not some random bs coord system

                surface.add(newMask)

                this.components.line.svg.attr({"mask": `url(#${maskID})`})
            }
        }
    }

    private arrangeContent(orientation: Dimensions) {
        // if (this.line === undefined || this.text === undefined) {
        //     throw new Error("Only for use when text and line are present.")
        // }
        if (this.components.line === undefined) {
            return 
        }

        switch (this.labelConfig.textPosition) {
            case "top":
                this.bind(this.components.line, orientation, "far", "here");
                this.bind(this.components.line, orientation, "far", "far");
                // this.text.padding[2] += this.line.style.thickness  // Add bottom padding to text
                break;
            case "inline":
                this.bind(this.components.line, orientation, "centre", "here");
                this.bind(this.components.line, orientation, "centre", "far");
                break;
            case "bottom":
                this.bind(this.components.line, orientation, "here", "here");
                this.bind(this.components.line, orientation, "here", "far");
                // this.text.padding[0] += this.line.style.thickness  // Add top padding to text
                break;
            default:
                throw new Error(`Unknown text position ${this.labelConfig.textPosition}`)
        }
    }
}