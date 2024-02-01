import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/aquisition.json"
import { Orientation, orientationEval } from "../../temporal.ts";
import SVGPulse from "./svgPulse.ts";
import { svgPulseInterface, svgPulseStyle } from "./svgPulse.ts";


export default class Aquisition extends SVGPulse {
    static defaults: svgPulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        path: defaultPulse.path,
        style: {
            width: defaultPulse.style.width,
            height: defaultPulse.style.height,
        }
    }
    
    constructor(path: string=Aquisition.defaults.path,
                orientation: Orientation=Aquisition.defaults.orientation, 
                timestamp: number=0, 
                padding: number[]=Aquisition.defaults.padding, 
                style: svgPulseStyle=Aquisition.defaults.style,
                offset: number[]=[0, 0]) {

        super(path, timestamp, orientation, padding, style, offset)
    }
}