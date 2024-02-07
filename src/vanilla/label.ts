import { Drawable } from "./drawable";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import * as defaultLabel from "./default/label.json";


export interface labelInterface {
    text?: string,
    x?: number,
    y?: number,
    padding?: number[],
    size?: number
}


export default class Label extends Drawable {
    static defaults: labelInterface = {
        text: defaultLabel.text,
        x: defaultLabel.x,
        y: defaultLabel.y,
        padding: defaultLabel.padding,
        size: defaultLabel.scale
    }

    public static anyArgConstruct(args: labelInterface): Label {
        const options = args ? { ...Label.defaults, ...args} : Label.defaults;

        return new Label(
            options.text!,
            options.x!,
            options.y!,
            options.padding!,
            options.size!
        )
    }

    text: string;
    size: number;

    padding: number[];
    
    constructor(text: string, x: number, y: number, padding: number[], size: number) {
        super(x, y);

        this.text = text;
        this.size = size;
        this.padding = padding;

        this.computeDimensions();
    }

    draw(surface: Svg) {
        const SVGEquation = TeXToSVG(this.text); 
        
        var SVGobj = SVG(SVGEquation);
        SVGobj.move(this.x, this.y);
        SVGobj.attr({preserveAspectRatio: "xMinYMin"})
        SVGobj.width(this.size);
        SVGobj.attr("height", null);
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
        SVGobj.width(this.size);
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

        console.log(width, height);

        this.bounds = {width, height};
    }

    // Sets x and y at the same time
    position(x?: number, y?: number) {
        this.x = x ?? this.x;
        this.y = y ?? this.y;
    }
}