import SimplePulse, {simplePulseInterface, simplePulseStyle} from "./simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/180pulse.json"
import { Orientation, orientationEval } from "../../temporal.ts";


export default class Pulse180 extends SimplePulse {
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        style: {
            width: defaultPulse.width,
            height: defaultPulse.height,
            fill: defaultPulse.fill,
            stroke: defaultPulse.stroke,
            strokeWidth: defaultPulse.strokeWidth
        }
    }
    
    constructor(orientation: Orientation=Pulse180.defaults.orientation,
                timestamp: number=0,  
                padding: number[]=Pulse180.defaults.padding, 
                style: simplePulseStyle=Pulse180.defaults.style) {

        super( orientation, timestamp, padding, style)
    }
}