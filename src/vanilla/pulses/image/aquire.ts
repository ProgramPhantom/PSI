import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/aquire.json"
import { Orientation, orientationEval } from "../../temporal.ts";
import SVGPulse from "./svgPulse.ts";
import { svgPulseInterface, svgPulseStyle } from "./svgPulse.ts";


export default class Aquire extends SVGPulse {
    static defaults: svgPulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        path: defaultPulse.path,
        style: {
            width: defaultPulse.style.width,
            height: defaultPulse.style.height,
        },
        label: undefined,
    }
    
    constructor(timestamp: number=0, 
                path: string=Aquire.defaults.path,
                orientation: Orientation=Aquire.defaults.orientation, 
                padding: number[]=Aquire.defaults.padding, 
                style: svgPulseStyle=Aquire.defaults.style,
                offset: number[]=[0, 0]) {

        super(timestamp, path, orientation, padding, style, offset)
        
    }
}