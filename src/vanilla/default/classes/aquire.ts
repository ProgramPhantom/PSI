import { SVG, Element as SVGElement, Svg } from '@svgdotjs/svg.js'
import * as defaultPulse from "../data/svgPulse/aquire.json" 
import { Alignment, Orientation, temporalConfig} from "../../temporal.ts";
import SVGPulse from "../../pulses/image/svgPulse.ts";
import { svgPulseInterface, svgPulseStyle } from "../../pulses/image/svgPulse.ts";
import Label, {Position, labelInterface} from '../../label.ts';

const DEFAULTSVG = await fetch(defaultPulse.path).then(
    (response) => response.text()
).then(
    (response) => {return response}
)


export default class Aquire extends SVGPulse {
    static defaults: svgPulseInterface = {...<any>defaultPulse};

    constructor(timestamp: number=0, 
                path: string=Aquire.defaults.path,
                config: temporalConfig=Aquire.defaults.config, 
                padding: number[]=Aquire.defaults.padding, 
                style: svgPulseStyle=Aquire.defaults.style,
                label: labelInterface=Aquire.defaults.label!,
                offset: number[]=[0, -1]) {

        super(timestamp, path, config, padding, style, label, offset)
        
    }

    getSVG(): string {
        return DEFAULTSVG;
    }

}