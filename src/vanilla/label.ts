import { Element, IElement } from "./element";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import * as defaultLabel from "./default/data/label.json";
import { FillObject, UpdateObj } from "./util";
import PaddedBox from "./paddedBox";


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

export interface ILabel extends IElement {
    padding: [number, number, number, number],
    offset: [number, number],
    text: string,
    position: Position,
    style: labelStyle,
}

export interface labelStyle {
    size: number,
    colour: string,
    background?: string,
}

export enum Position {top="top",
                      right="right",
                      bottom="bottom",
                      left="left",
                      centre="centre"}


export default class Label extends PaddedBox {
    static defaults: {[key: string]: ILabel} = {"label": {...<ILabel>defaultLabel}}



    text: string;
    style: labelStyle;

    padding: [number, number, number, number];
    position: Position;
    
    constructor(params: Partial<ILabel>, templateName: string="label") {
        var fullParams: ILabel = FillObject(params, Label.defaults[templateName])
        super(fullParams.offset, fullParams.padding, undefined, undefined, fullParams.height, fullParams.width);
        
        this.text = fullParams.text;
        this.style = fullParams.style;
        this.padding = fullParams.padding;
        this.position = fullParams.position;

        var dim = this.resolveDimensions()
        this.contentHeight = dim.height;
        this.contentWidth = dim.width;
    }
    
    // Sets this.width and this.height
    // Currently needs to add and remove the svg to find these dimensions, not ideal
    resolveDimensions(): {width: number, height: number} {
        var SVGEquation = TeXToSVG(`${this.text}`); 
        
        var temp = SVG().addTo('#drawDiv').size(300, 300)  // TERRIBLE CODE HERE.

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

        return {width: width, height: height}
    }

    draw(surface: Svg) {
        
        const SVGEquation = TeXToSVG(`${this.text}`);  // APPARENTLY this.text is ending up as an int (json parse???) 
        
        
        var SVGobj = SVG(SVGEquation);
        SVGobj.move(this.x, this.y);
        SVGobj.attr({preserveAspectRatio: "xMinYMin"})
        SVGobj.width(this.style.size);
        
        SVGobj.attr({"height": null, "style": `color:${this.style.colour}`});
        var group = SVGobj.children()[1];

        if (this.style.background) {
            group.add(SVG(`<rect width="100%" height="100%" fill="${this.style.background}"></rect>`), 0)
        }
        
        surface.add(SVGobj);
    }
}