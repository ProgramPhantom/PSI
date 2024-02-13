import SimplePulse, {simplePulseInterface, simplePulseStyle} from "./simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/180pulse.json"
import { Alignment, Orientation, temporalPosition } from "../../temporal.ts";
import { LabelPosition, labelInterface } from "../../label.ts";
import { off } from "process";

export default class Pulse180 extends SimplePulse {
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        positioning: {
            orientation: Orientation[defaultPulse.positioning.orientation  as keyof typeof Orientation],
            alginment: Alignment[defaultPulse.positioning.alignment as keyof typeof Alignment],
            overridePad: defaultPulse.positioning.overridePad,
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
            labelPosition: LabelPosition[defaultPulse.label.labelPosition as keyof typeof LabelPosition] ,
            style: {
                size: defaultPulse.label.style.size,
                colour: defaultPulse.label.style.colour
            }
        }
    }
    
    constructor(timestamp: number=0, 
                positioning: temporalPosition=Pulse180.defaults.positioning, 
                padding: number[]=Pulse180.defaults.padding, 
                style: simplePulseStyle=Pulse180.defaults.style,
                label: labelInterface=Pulse180.defaults.label!,
                offset: number[]=[0, 0]) {

        super(timestamp, positioning, padding, style, label, offset)
    }
}