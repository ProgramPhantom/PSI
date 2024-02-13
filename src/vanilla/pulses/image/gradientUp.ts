import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/gradientup.json"
import { Alignment, Orientation, temporalPosition } from "../../temporal.ts";
import SVGPulse from "./svgPulse.ts";
import { svgPulseInterface, svgPulseStyle } from "./svgPulse.ts";
import Label, {labelInterface} from '../../label.ts';

const DEFAULTSVG = await fetch(defaultPulse.path).then(
    (response) => response.text()
).then(
    (response) => {return response}
)


export default class GradientUp extends SVGPulse {
    static defaults: svgPulseInterface = {
        padding: defaultPulse.padding,

        positioning: {
            orientation: Orientation[defaultPulse.positioning.orientation as keyof typeof Orientation],
            alginment: Alignment[defaultPulse.positioning.alignment as keyof typeof Alignment],
            overridePad: defaultPulse.positioning.overridePad,
        },

        path: defaultPulse.path,
        style: {
            width: defaultPulse.style.width,
            height: defaultPulse.style.height,
        },
        label: undefined
    }

    constructor(timestamp: number=0, 
                path: string=GradientUp.defaults.path,
                positioning: temporalPosition=GradientUp.defaults.positioning, 
                padding: number[]=GradientUp.defaults.padding, 
                style: svgPulseStyle=GradientUp.defaults.style,
                label: labelInterface=GradientUp.defaults.label!,
                offset: number[]=[0, 1]) {

        super(timestamp, path, positioning, padding, style, label, offset)

    }

    getSVG(): string {
        return DEFAULTSVG;
    }

}