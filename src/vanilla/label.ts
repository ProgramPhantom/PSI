import { Visual, IVisual as IVisual } from "./visual";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import defaultLabel from "./default/data/label.json";
import { FillObject, RecursivePartial, UpdateObj } from "./util";
import PaddedBox from "./paddedBox";


export interface ILabel extends IVisual {
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


export default class Label extends Visual {
    static defaults: {[key: string]: ILabel} = {"label": {...<ILabel>defaultLabel}}



    text: string;
    style: labelStyle;

    padding: [number, number, number, number];
    position: Position;
    
    constructor(params: RecursivePartial<ILabel>, templateName: string="label") {
        var fullParams: ILabel = FillObject(params, Label.defaults[templateName])
        super(fullParams, templateName);
        
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
        
        if (this.dirty) {
            if (this.svg) {
                surface.removeElement(this.svg);
            }

            const SVGEquation = TeXToSVG(`${this.text}`);  // APPARENTLY this.text is ending up as an int (json parse???) 
        
            var SVGobj = SVG(SVGEquation);
            SVGobj.move(this.x, this.y);
            SVGobj.attr({preserveAspectRatio: "xMinYMin"})
            SVGobj.width(this.style.size);  // TODO: fix  this.
            
            SVGobj.attr({"height": null, "style": `color:${this.style.colour}`});
            var group = SVGobj.children()[1];
    
            if (this.style.background) {
                group.add(SVG(`<rect width="100%" height="100%" fill="${this.style.background}"></rect>`), 0)
            }
            
            this.svg = SVGobj;
            surface.add(SVGobj);
        }
        
    }
}