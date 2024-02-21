import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../data/svgPulse/chirplohi.json"
import { Alignment, Orientation, temporalConfig } from "../../temporal.ts";
import SVGPulse from "../../pulses/image/svgPulse.ts";
import { svgPulseInterface, svgPulseStyle } from "../../pulses/image/svgPulse.ts";
import Label, {labelInterface} from '../../label.ts';

const DEFAULTSVG = await fetch(defaultPulse.path).then(
    (response) => response.text()
).then(
    (response) => {return response}
)


export default class ChirpLoHi extends SVGPulse {
    static defaults: svgPulseInterface = {...<any>defaultPulse};

    constructor(timestamp: number=0, 
                path: string=ChirpLoHi.defaults.path,
                config: temporalConfig=ChirpLoHi.defaults.config, 
                padding: number[]=ChirpLoHi.defaults.padding, 
                style: svgPulseStyle=ChirpLoHi.defaults.style,
                label: labelInterface=ChirpLoHi.defaults.label!,
                offset: number[]=[0, 1]) {

        super(timestamp, path, config, padding, style, label, offset)

    }

    getSVG(): string {
        return DEFAULTSVG;
    }

}