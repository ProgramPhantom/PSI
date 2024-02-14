import SimplePulse, {simplePulseInterface, simplePulseStyle} from "../../pulses/simple/simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../data/180pulse.json"
import { Alignment, Orientation, temporalConfig } from "../../temporal.ts";
import { LabelPosition, labelInterface } from "../../label.ts";
import { off } from "process";

export default class Pulse180 extends SimplePulse {
    static defaults: simplePulseInterface = {...<any>defaultPulse}
    
    constructor(timestamp: number=0, 
                config: temporalConfig=Pulse180.defaults.config, 
                padding: number[]=Pulse180.defaults.padding, 
                style: simplePulseStyle=Pulse180.defaults.style,
                label: labelInterface=Pulse180.defaults.label!,
                offset: number[]=[0, 0]) {

        super(timestamp, config, padding, style, label, offset)
    }
}