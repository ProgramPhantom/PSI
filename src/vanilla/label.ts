import { Element } from "./drawable";
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
    padding: number[],
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


export default class Label extends Element {
    static defaults: {[key: string]: labelInterface} = {"label": {...<any>defaultLabel}}

    text: string;
    style: labelStyle;

    padding: number[];
    position: Position;
    
    constructor(params: labelInterface,
                offset: number[]=[0, 0]) {

        super(0, 0, offset);

        this.text = params.text;
        this.style = params.style;
        this.padding = params.padding;
        this.position = params.position;

        this.computeDimensions();
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

    // Sets this.width and this.height
    // Currently needs to add and remove the svg to find these dimensions, not ideal
    computeDimensions() {
        
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

        this.dim = {width: width, height: height};
    }

    // Sets x and y at the same time
    move(x?: number, y?: number) {
        this.x = x ?? this.x;
        this.y = y ?? this.y;
    }
}