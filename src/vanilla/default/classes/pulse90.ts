import SimplePulse, {simplePulseInterface, simplePulseStyle} from "../../pulses/simple/simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../data/90pulse.json"
import { Alignment, Orientation, temporalConfig } from "../../temporal.ts";
import { LabelPosition, labelInterface } from "../../label.ts";



export default class Pulse90 extends SimplePulse {
    static defaults: simplePulseInterface =  {...<any>defaultPulse};

    constructor(timestamp: number=0, 
        config: temporalConfig=Pulse90.defaults.config, 
        padding: number[]=Pulse90.defaults.padding, 
        style: simplePulseStyle=Pulse90.defaults.style,
        label: labelInterface=Pulse90.defaults.label!,
        offset: number[]=[0, 0]) {

        super(timestamp, config, padding, style, label, offset)

        console.log(this.width)
    }
}