import SimplePulse, {simplePulseInterface, simplePulseStyle} from "./simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/90pulse.json"
import { Orientation, orientationEval } from "../../temporal.ts";



export default class Pulse90 extends SimplePulse {
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        style: {
            width: defaultPulse.width,
            height: defaultPulse.height,
            fill: defaultPulse.fill
        }
    }
    
    constructor(orientation: Orientation=Pulse90.defaults.orientation, 
                timestamp: number=0, 
                padding: number[]=Pulse90.defaults.padding, 
                style: simplePulseStyle=Pulse90.defaults.style,
                offset: number[]=[0, 0]) {

        super( timestamp, orientation, padding, style, offset)
    }
}