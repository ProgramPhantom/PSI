import SimplePulse, {simplePulseInterface, simplePulseStyle} from "../../pulses/simple/simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../data/90pulse.json"
import { Alignment, Orientation, temporalConfig } from "../../temporal.ts";
import { LabelPosition, labelInterface } from "../../label.ts";



export default class Pulse90 extends SimplePulse {
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        config: {
            orientation: Orientation[defaultPulse.config.orientation  as keyof typeof Orientation],
            alginment: Alignment[defaultPulse.config.alignment as keyof typeof Alignment],
            overridePad: defaultPulse.config.overridePad,
            inheritWidth: defaultPulse.config.inheritWidth,
        },
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
            labelPosition: LabelPosition[defaultPulse.label.labelPosition as keyof typeof LabelPosition],
            style: {
                size: defaultPulse.label.style.size,
                colour: defaultPulse.label.style.colour
            }
        }
    }
    
    constructor(timestamp: number=0, 
        config: temporalConfig=Pulse90.defaults.config, 
        padding: number[]=Pulse90.defaults.padding, 
        style: simplePulseStyle=Pulse90.defaults.style,
        label: labelInterface=Pulse90.defaults.label!,
        offset: number[]=[0, 0]) {

        super(timestamp, config, padding, style, label, offset)
    }
}