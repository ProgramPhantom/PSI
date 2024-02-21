import { SVG, Svg } from "@svgdotjs/svg.js";
import Temporal, {Alignment, Orientation, temporalInterface, temporalConfig} from "../../temporal";
import ImagePulse, { imagePulseStyle } from "./imagePulse";
import * as defaultPulse from "../../default/data/svgPulse/svgPulse.json"
import {LabelPosition, labelInterface } from "../../label";
import { UpdateObj } from "../../util";
import {defs} from "../../default/data/svgPulse"

const svgContent: {[path: string]: string} = {}
const svgPaths = ["\\src\\assets\\aquire2.svg",
                  "\\src\\assets\\saltirelohi.svg",
                  "\\src\\assets\\saltirehilo.svg",
                  "\\src\\assets\\halfsine.svg",
                  "\\src\\assets\\chirplohi.svg",
                  "\\src\\assets\\chirphilo.svg"]

for (const p of svgPaths) {
    var svg = await fetch(p).then(
        (response) => response.text()
    ).then(
        (response) => {return response}
    )

    svgContent[p] = svg;
}

console.log(svgContent);
    

                      

export interface svgPulseInterface extends temporalInterface {
    path: string,
    style: svgPulseStyle,
}

export interface svgPulseStyle {
    width: number,
    height: number
}

export default class SVGPulse extends Temporal {
    // svg
    static defaults: {[key: string]: svgPulseInterface} = {...<any>defs};

    static anyArgConstruct(defaultArgs: svgPulseInterface, args: svgPulseInterface): SVGPulse {
        const options = args ? UpdateObj(defaultArgs, args) : defaultArgs;

        var el = new SVGPulse(options.timestamp,
                                {path: options.path,
                                 config: options.config,
                                 padding: options.padding,
                                 style: options.style,
                                 label: options.label})

        return el;
    }

    svgContent: string;
    style: imagePulseStyle;
    path: string;

    constructor(timestamp: number,
                params: svgPulseInterface,
                offset: number[]=[0, 0]) {

        super(timestamp,  
              params,
              offset);

        this.style = params.style;
        this.path = params.path;

        this.svgContent = this.getSVG();

        this.bounds = {width: this.style.width, height: this.style.height};
        this.actualBounds = {
            width: this.bounds.width + this.padding[1] + this.padding[3],
            height: this.bounds.height + this.padding[0] + this.padding[2]
        }
    }
        
    getSVG(): string {
        console.log(this.path)
        return svgContent[this.path]
    }


    draw(surface: Svg) {
        
        var obj = SVG(this.svgContent);
        obj.move(this.x + this.offset[0], this.y + this.offset[1]);
        obj.size(this.width, this.height);
        obj.attr({"preserveAspectRatio": "none"})
        obj.attr({"stroke": "black"})
        // var foreignObject = surface.foreignObject(200, 200);
        surface.add(obj);


        if (this.label) {
            this.drawLabel(surface);
        }
    }
}