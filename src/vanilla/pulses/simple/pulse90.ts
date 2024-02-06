import SimplePulse, {simplePulseInterface, simplePulseStyle} from "./simplePulse.ts";
import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/90pulse.json"
import { LabelPosition, Orientation, orientationEval, positionEval } from "../../temporal.ts";
import { labelInterface } from "../../label.ts";



export default class Pulse90 extends SimplePulse {
    static defaults: simplePulseInterface = {
        padding: defaultPulse.padding,
        orientation: orientationEval[defaultPulse.orientation],
        labelPosition: positionEval[defaultPulse.labelPosition],
        style: {
            width: defaultPulse.width,
            height: defaultPulse.height,
            fill: defaultPulse.fill,
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
                orientation: Orientation=Pulse90.defaults.orientation, 
                labelPosition: LabelPosition=Pulse90.defaults.labelPosition,
                padding: number[]=Pulse90.defaults.padding, 
                style: simplePulseStyle=Pulse90.defaults.style,
                label: labelInterface=Pulse90.defaults.label,
                offset: number[]=[0, 0]) {

        console.log("lP in construct: ", labelPosition);

        super(timestamp, orientation, labelPosition, padding, style, label, offset)
    }
}