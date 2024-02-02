import { Drawable } from "./drawable";
import { SVG as SV, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import * as defaultLabel from "./default/label.json";

import mathjax  from 'mathjax-full/js/mathjax'
import { TeX } from 'mathjax-full/js/input/tex'
import { SVG } from 'mathjax-full/js/output/svg'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html'


export interface labelInterface {
    text: string,
    x: number,
    y: number,
    scale: number
}

export default class Label extends Drawable {
    static defaults: labelInterface = {
        text: defaultLabel.text,
        x: defaultLabel.x,
        y: defaultLabel.y,
        scale: defaultLabel.scale
    }

    public static anyArgConstruct(text: string, args: any): Label {
        const options = args ? { ...Label.defaults, ...args, text: text } : Label.defaults;

        return new Label(
            options.text,
            options.x,
            options.y,
            options.scale
        )
    }

    text: string;
    scale: number;
    
    constructor(text: string, x: number, y: number, scale: number) {
        super(x, y);

        this.text = text;
        this.scale = scale;
    }

    draw(surface: Svg) {
        const options = {
            ex: 100,  // This does nothing apparently
        };

        const SVGEquation = TeXToSVG(this.text, options); // returns <svg style="vertical-align: -2.172ex" xmlns="http://www.w3.org/2000/svg" width="18.199ex" height="5.451ex" role="img" focusable="false" viewBox="0 -1449.5 8044 2409.5" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path ...
        
        var SVGobj = SV(SVGEquation);

        var defs = SVGobj.get(0);
        var group = SVGobj.get(1)


        SVGobj.attr({style: ""});
        SVGobj.move(this.x, this.y);
        // SVGobj.scale(4, 4);

        // Figure out whats going on here.
        // SVGobj.size(20, 20);  // I have no idea whats going on but it works and doesn't mess with the SVG

        surface.add(SVGobj);

    
        // surface.add(SVGobj);
        
        // surface.add(defs);
        // surface.add(group);
    }
}