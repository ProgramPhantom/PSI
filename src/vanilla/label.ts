import { Drawable } from "./drawable";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import * as defaultLabel from "./default/data/label.json";
import { UpdateObj } from "./util";

interface Dim {
    width: number,
    height: number
}

interface Bounds {
    top: number,
    bottom: number,
    left: number,
    right: number

    width: number,
    height: number,
}

export interface labelInterface {
    text?: string,
    padding?: number[],
    labelPosition: LabelPosition,
    style?: labelStyle,
}

export interface labelStyle {
    size: number,
    colour: string
}

export enum LabelPosition {top="top",
                           right="right",
                           bottom="bottom",
                           left="left",
                           centre="centre"}


export default class Label extends Drawable {
    static defaults: labelInterface = {...<any>defaultLabel}

    public static anyArgConstruct(args: labelInterface): Label {
        const options = args ? UpdateObj(Label.defaults, args) : Label.defaults;

        return new Label(
            options.text!,
            options.padding!,
            options.labelPosition!,
            options.style!
        )
    }

    private _actualBounds?: Bounds;

    text: string;
    style: labelStyle;

    padding: number[];
    labelPosition: LabelPosition;
    
    constructor(text: string, padding: number[], labelPosition: LabelPosition, style: labelStyle) {
        super(0, 0);

        this.text = text;
        this.style = style;
        this.padding = padding;
        this.labelPosition = labelPosition;

        this.computeDimensions();
    }

    draw(surface: Svg) {
        const SVGEquation = TeXToSVG(this.text); 
        
        var SVGobj = SVG(SVGEquation);
        SVGobj.move(this.x, this.y);
        SVGobj.attr({preserveAspectRatio: "xMinYMin"})
        SVGobj.width(this.style.size);
        
        SVGobj.attr({"height": null, "style": `color:${this.style.colour}`});
        surface.add(SVGobj);
    }

    // Sets this.width and this.height
    // Currently needs to add and remove the svg to find these dimensions, not ideal
    computeDimensions() {
        const SVGEquation = TeXToSVG(this.text); 

        var temp = SVG().addTo('#canvasDiv').size(300, 300)

        var SVGobj = SVG(SVGEquation);
        
        SVGobj.id("svgTempID");
        SVGobj.attr({preserveAspectRatio: "xMinYMin"})
        SVGobj.width(this.style.size);
        SVGobj.attr("height", null);

        temp.add(SVGobj);

        var content = document.getElementById("svgTempID");
        SVGobj.attr("id", null);
        
        var width = content!.getBoundingClientRect().width;
        var height = content!.getBoundingClientRect().height;

        var width = width;
        var height = height;

        SVGobj.remove();
        temp.remove();

        this.bounds = {width: width, height: height};
        this.actualBounds = {
            width: width + this.padding[1] + this.padding[3],
            height: height + this.padding[0] + this.padding[2]
        }
    }

    // Sets x and y at the same time
    position(x?: number, y?: number) {
        this.x = x ?? this.x;
        this.y = y ?? this.y;
    }

    get actualBounds(): Bounds {
        if (this._actualBounds) {
            return this._actualBounds;
        }
        throw new Error("Element has no dimensions");
    }
    set actualBounds(b: Dim)  {
        var top = this.y;
        var left = this.x;

        var bottom = this.y + b.height;
        var right = this.x + b.width;


        this._actualBounds = {top: top, right: right, bottom: bottom, left: left, width: b.width, height: b.height};
    }

    get actualWidth(): number {
        if (this._actualBounds) {
            return this._actualBounds.width;
        }
        throw new Error("Dimensions undefined")
    }
    get actualHeight(): number {
        if (this._actualBounds) {
            return this._actualBounds.height;
        }
        throw new Error("Dimensions undefined")
    }
}