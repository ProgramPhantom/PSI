import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../../default/gradientup.json"
import { Alignment, Orientation, temporalConfig } from "../../temporal.ts";
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

        config: {
            orientation: Orientation[defaultPulse.config.orientation as keyof typeof Orientation],
            alginment: Alignment[defaultPulse.config.alignment as keyof typeof Alignment],
            overridePad: defaultPulse.config.overridePad,
            inheritWidth: defaultPulse.config.inheritWidth,
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
                config: temporalConfig=GradientUp.defaults.config, 
                padding: number[]=GradientUp.defaults.padding, 
                style: svgPulseStyle=GradientUp.defaults.style,
                label: labelInterface=GradientUp.defaults.label!,
                offset: number[]=[0, 1]) {

        super(timestamp, path, config, padding, style, label, offset)

    }

    getSVG(): string {
        return DEFAULTSVG;
    }

}