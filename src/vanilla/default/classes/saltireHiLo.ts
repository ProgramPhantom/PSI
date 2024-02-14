import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../data/saltirehilo.json"
import { Alignment, Orientation, temporalConfig } from "../../temporal.ts";
import SVGPulse from "../../pulses/image/svgPulse.ts";
import { svgPulseInterface, svgPulseStyle } from "../../pulses/image/svgPulse.ts";
import Label, {labelInterface} from '../../label.ts';

const DEFAULTSVG = await fetch(defaultPulse.path).then(
    (response) => response.text()
).then(
    (response) => {return response}
)


export default class SaltireHiLo extends SVGPulse {
    static defaults: svgPulseInterface = {...<any>defaultPulse}

    constructor(timestamp: number=0, 
                path: string=SaltireHiLo.defaults.path,
                config: temporalConfig=SaltireHiLo.defaults.config, 
                padding: number[]=SaltireHiLo.defaults.padding, 
                style: svgPulseStyle=SaltireHiLo.defaults.style,
                label: labelInterface=SaltireHiLo.defaults.label!,
                offset: number[]=[0, 1]) {

        super(timestamp, path, config, padding, style, label, offset)

    }

    getSVG(): string {
        return DEFAULTSVG;
    }

}