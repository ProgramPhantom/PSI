import { Drawable } from "./drawable";
import { SVG , Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import TeXToSVG from "tex-to-svg";
import * as defaultLabel from "./default/label.json";


export interface labelInterface {
    text: string,
    x: number,
    y: number,
    padding: number[],
    size: number
}

export interface hasLabel {
    label?: Label,
    drawLabel(surface: Svg): number[] | void,
}

export default class Label extends Drawable {
    static defaults: labelInterface = {
        text: defaultLabel.text,
        x: defaultLabel.x,
        y: defaultLabel.y,
        padding: defaultLabel.padding,
        size: defaultLabel.scale
    }

    public static anyArgConstruct(args: any): Label {
        const options = args ? { ...Label.defaults, ...args} : Label.defaults;

        console.log(options);

        return new Label(
            options.text,
            options.x,
            options.y,
            options.padding,
            options.size
        )
    }

    text: string;
    size: number;

    width: number;
    height: number;
    padding: number[];
    
    constructor(text: string, x: number, y: number, padding: number[], size: number) {
        super(x, y);

        this.text = text;
        this.size = size;
        this.padding = padding;

        [this.width, this.height] = [0, 0]

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
    computeDimensions(surface: Svg) {
        const SVGEquation = TeXToSVG(this.text); 

        // Create and add
        var SVGobj = SVG(SVGEquation);
        SVGobj.id("svgTempID");
        surface.add(SVGobj);

        // Do this so its the right size
        SVGobj.attr({preserveAspectRatio: "xMinYMin"})
        SVGobj.width(this.size);
        SVGobj.attr("height", null);


        // Get using this method instead 
        var content = document.getElementById("svgTempID");
        SVGobj.attr("id", null);
        
        var width = content!.getBoundingClientRect().width;
        var height = content!.getBoundingClientRect().height;

        this.width = width;
        this.height = height;

        console.log(width, height);

        SVGobj.remove();
    }

    // Sets x and y at the same time
    position(x?: number, y?: number) {
        this.x = x ?? this.x;
        this.y = y ?? this.y;
    }
}