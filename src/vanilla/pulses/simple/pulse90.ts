import SimplePulse, {simplePulseInterface, simplePulseStyle} from "./simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/90pulse.json"
import { Orientation, orientationEval } from "../../temporal.ts";
import { positionEval } from "../../label.ts";
import { labelInterface } from "../../label.ts";



export default class Pulse90 extends SimplePulse {
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        style: {
            width: defaultPulse.width,
            height: defaultPulse.height,
            fill: defaultPulse.fill,
            stroke: defaultPulse.stroke,
            strokeWidth: defaultPulse.strokeWidth
        },
        label: {
            text: defaultPulse.label.text,
            padding: defaultPulse.label.padding,
            labelPosition: positionEval[defaultPulse.label.labelPosition],
            size: defaultPulse.label.size,
        }
    }
    
    constructor(timestamp: number=0, 
                orientation: Orientation=Pulse90.defaults.orientation, 
                padding: number[]=Pulse90.defaults.padding, 
                style: simplePulseStyle=Pulse90.defaults.style,
                label: labelInterface=Pulse90.defaults.label!,
                offset: number[]=[0, 0]) {

        super(timestamp, orientation, padding, style, label, offset)
    }
}