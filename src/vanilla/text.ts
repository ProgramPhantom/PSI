import { Visual, IVisual as IVisual, Display } from "./visual";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import defaultLabel from "./default/data/text.json";
import { FillObject, RecursivePartial, UpdateObj } from "./util";
import PaddedBox from "./paddedBox";

export const EXTOPX = 38.314;

export interface IText extends IVisual {
    text: string,
    style: ITextStyle,
}

export interface ITextStyle {
    fontSize: number,
    colour: string,
    background?: string,
    display: Display
}

export enum Position {top="top",
                      right="right",
                      bottom="bottom",
                      left="left",
                      centre="centre"}


export default class Text extends Visual implements IText {
    static defaults: {[key: string]: IText} = {"default": {...<IText>defaultLabel}}

    intrinsicSize: {width: number, height: number}
    wHRatio: number

    text: string;
    style: ITextStyle;
    
    constructor(params: RecursivePartial<IText>, templateName: string="default") {
        var fullParams: IText = FillObject(params, Text.defaults[templateName])
        super(fullParams, templateName);
        
        this.text = fullParams.text;
        this.style = fullParams.style;

        this.intrinsicSize = this.resolveDimensions();
        this.wHRatio = this.intrinsicSize.width / this.intrinsicSize.height;

        this.contentHeight = this.intrinsicSize.height/5 * this.style.fontSize/EXTOPX;
        this.contentWidth = this.intrinsicSize.width/5 * this.style.fontSize/EXTOPX;
    }
    
    // TODO: investigate this
    // Sets this.width and this.height
    // Currently needs to add and remove the svg to find these dimensions, not ideal
    resolveDimensions(): {width: number, height: number} {
        var SVGEquation: string = TeXToSVG(`${this.text}`); 
        
        var SVGobj: SVGElement = SVG(SVGEquation);
        
        SVGobj.id("svgTempID");
        SVGobj.attr({preserveAspectRatio: "xMinYMin"})

        
        var exWidthString: string = <string>SVGobj.width();
        var exHeightString: string = <string>SVGobj.height();
        
        exWidthString = Array.from(exWidthString).splice(0, exWidthString.length-2).join("");
        exHeightString = Array.from(exHeightString).splice(0, exHeightString.length-2).join("");

        var exWidth: number = Number(exWidthString);
        var exHeight: number = Number(exHeightString);

        SVGobj.remove();

        return {width: exWidth * EXTOPX, height: exHeight * EXTOPX}
    }

    draw(surface: Svg) {
        
        if (this.dirty) {
            if (this.svg) {
                surface.removeElement(this.svg);
            }

            const SVGEquation = TeXToSVG(`${this.text}`);  // APPARENTLY this.text is ending up as an int (json parse???) 
        
            var SVGobj = SVG(SVGEquation);
            SVGobj.move(this.x, this.y);
            SVGobj.attr({height: null, preserveAspectRatio: "xMinYMin"})
            SVGobj.width(this.contentWidth!); 
            
            SVGobj.attr({"style": `color:${this.style.colour}`});
            var group = SVGobj.children()[1];
    
            if (this.style.background) {
                group.add(SVG(`<rect width="100%" height="100%" fill="${this.style.background}"></rect>`), 0)
            }
            
            this.svg = SVGobj;
            surface.add(SVGobj);
        }
        
    }
}