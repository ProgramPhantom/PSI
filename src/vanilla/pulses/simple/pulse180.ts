import SimplePulse, {simplePulseInterface, simplePulseStyle} from "./simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/180pulse.json"
import { LabelPosition, Orientation, orientationEval, positionEval } from "../../temporal.ts";
import { labelInterface } from "../../label.ts";
import { off } from "process";


export default class Pulse180 extends SimplePulse {
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        labelPosition: positionEval[defaultPulse.labelPosition],
        style: {
            width: defaultPulse.width,
            height: defaultPulse.height,
            fill: defaultPulse.fill,
            stroke: defaultPulse.stroke,
            strokeWidth: defaultPulse.strokeWidth
        },
        label: {
            text: defaultPulse.label.text,
            x: defaultPulse.label.x,
            y: defaultPulse.label.y,
            padding: defaultPulse.label.padding,
            size: defaultPulse.label.size,
        }
    }
    
    constructor(timestamp: number=0, 
                orientation: Orientation=Pulse180.defaults.orientation, 
                labelPosition: LabelPosition=Pulse180.defaults.labelPosition,
                padding: number[]=Pulse180.defaults.padding, 
                style: simplePulseStyle=Pulse180.defaults.style,
                label: labelInterface=Pulse180.defaults.label!,
                offset: number[]=[0, 0]) {

        super(timestamp, orientation, labelPosition, padding, style, label, offset)
    }
}