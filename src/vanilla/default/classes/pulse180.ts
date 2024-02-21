import SimplePulse, {simplePulseInterface, simplePulseStyle} from "../../pulses/simple/simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../data/simplePulse/180pulse.json"
import { Alignment, IDefaultConstruct, Orientation, temporalConfig } from "../../temporal.ts";
import { LabelPosition, labelInterface } from "../../label.ts";
import { off } from "process";

export default class Pulse180 extends SimplePulse {
    static defaults: simplePulseInterface = {...<any>defaultPulse}
    
    constructor(timestamp: number=0, 
                params: simplePulseInterface=Pulse180.defaults,
                offset: number[]=[0, 0]) {

        super(timestamp, params, offset)
    }
}